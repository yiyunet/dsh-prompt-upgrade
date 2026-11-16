/**
 * The prompt-upgrade settings panel, rendered inside the 「ANB 工具」 shell tab.
 *
 * The shell owns the settings navigation entry (N29: a panel never registers its own
 * `settings.section` and never draws its own page title), so this component draws
 * only the controls, their grouping, and the save.
 *
 * Three control kinds, because one free-text input is not honest for all of them:
 * - text/number fields use a labelled input with an override badge, a reset that
 *   stages a clear back to the composition layer, and an invalid marker;
 * - booleans use a checkbox, because typing "true" is not a real toggle;
 * - the system prompt uses a textarea, because the host schema declares it as one
 *   (`.role('textarea')`) and a single-line input cannot edit a long prompt.
 *
 * Nothing here writes: every control reports what the user typed, and the save is
 * the single point where a draft becomes a document mutation.
 * @module dsh-prompt-upgrade/client/PromptUpgradeSettings
 */

import { useEffect, useId, useRef } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type { NS, PromptEnhanceKey } from './locales'
import type { UpgradeField, UpgradeFormState, UpgradePanelInjected } from './settings-form'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  /**
   * The 「ANB 工具」 shell's panel slot (department convention, see N29). The host
   * ships no such slot: the shell declares it as its own child list, and each ANB
   * plugin registers its panel into it.
   */
  interface SlotMap {
    'anb.tool.tab': { kind: 'list'; scope: 'root' }
  }
}

/** Props delivered by the shell tab plus the registration's injected face. */
export type PromptUpgradeSettingsProps =
  & PropsRuntime<'anb.tool.tab'>
  & PropsLocale<typeof NS>
  & InjectFace<UpgradePanelInjected>

/** Panel-wide copy shared by every control. */
interface FieldCopy {
  overridden: string
  reset: string
  invalid: string
}

/** The shared chrome arguments every control kind receives. */
interface RowShared {
  state: UpgradeFormState
  disabled: boolean
  t: PromptUpgradeSettingsProps['t']
  copy: FieldCopy
  onEdit: (text: string) => void
  onReset: () => void
}

/** Translate one field's label. */
function fieldLabel(t: PromptUpgradeSettingsProps['t'], field: UpgradeField): string {
  return t(`field.${field}.label` as PromptEnhanceKey)
}

/** Translate one field's hint. */
function fieldHint(t: PromptUpgradeSettingsProps['t'], field: UpgradeField): string {
  return t(`field.${field}.hint` as PromptEnhanceKey)
}

/** The override badge plus the reset that stages a clear back to the composition layer. */
function OverrideBadge({ field, state, disabled, copy, onReset }: Omit<RowShared, 't' | 'onEdit'> & { field: UpgradeField }) {
  if (!state[field].overridden) return null
  return (
    <span className="dsh-pe-badge">
      <span className="dsh-pe-badge-tag">{copy.overridden}</span>
      <button type="button" className="dsh-pe-badge-reset" disabled={disabled} onClick={onReset}>
        {copy.reset}
      </button>
    </span>
  )
}

/** One labelled control's head: label, then the override badge when a user value stands. */
function RowHead({ field, shared }: { field: UpgradeField; shared: RowShared }) {
  const id = `dsh-pe-field-${field}`
  return (
    <div className="dsh-pe-row-head">
      <label className="dsh-pe-row-label" htmlFor={id}>{fieldLabel(shared.t, field)}</label>
      <OverrideBadge
        field={field}
        state={shared.state}
        disabled={shared.disabled}
        copy={shared.copy}
        onReset={shared.onReset}
      />
    </div>
  )
}

/** A hint line, replaced by the invalid marker while the draft is refused. */
function RowMessage({ field, shared }: { field: UpgradeField; shared: RowShared }) {
  const staged = shared.state[field]
  return (
    <p className={staged.invalid ? 'dsh-pe-row-invalid' : 'dsh-pe-row-hint'}>
      {staged.invalid ? shared.copy.invalid : fieldHint(shared.t, field)}
    </p>
  )
}

/** A staged text or number field. */
function ValueRow({ field, numeric = false, shared }: { field: UpgradeField; numeric?: boolean; shared: RowShared }) {
  const id = `dsh-pe-field-${field}`
  const staged = shared.state[field]
  return (
    <div className="dsh-pe-row">
      <RowHead field={field} shared={shared} />
      <input
        id={id}
        className="dsh-pe-input"
        type="text"
        value={staged.text}
        disabled={shared.disabled}
        aria-invalid={staged.invalid || undefined}
        {...numeric ? { inputMode: 'numeric' as const } : {}}
        onChange={(event) => { shared.onEdit(event.target.value) }}
      />
      <RowMessage field={field} shared={shared} />
    </div>
  )
}

/** A staged boolean field: a real toggle rather than "type true/false". */
function BoolRow({ field, shared }: { field: UpgradeField; shared: RowShared }) {
  // A stable id is needed by the label association; `useId` keeps two panels from
  // colliding when the shell renders one per plugin.
  const generated = useId()
  const id = `dsh-pe-field-${field}-${generated}`
  const staged = shared.state[field]
  return (
    <div className="dsh-pe-row">
      <RowHead field={field} shared={shared} />
      <input
        id={id}
        type="checkbox"
        className="dsh-pe-checkbox"
        checked={staged.text === 'true'}
        disabled={shared.disabled}
        onChange={(event) => { shared.onEdit(event.target.checked ? 'true' : 'false') }}
      />
      <RowMessage field={field} shared={shared} />
    </div>
  )
}

/** A staged multi-line text field (the system prompt). */
function AreaRow({ field, shared }: { field: UpgradeField; shared: RowShared }) {
  const id = `dsh-pe-field-${field}`
  const staged = shared.state[field]
  return (
    <div className="dsh-pe-row">
      <RowHead field={field} shared={shared} />
      <textarea
        id={id}
        className="dsh-pe-textarea"
        rows={6}
        value={staged.text}
        disabled={shared.disabled}
        aria-invalid={staged.invalid || undefined}
        onChange={(event) => { shared.onEdit(event.target.value) }}
      />
      <RowMessage field={field} shared={shared} />
    </div>
  )
}

/**
 * Render the prompt-upgrade settings panel.
 * @param props - the shell tab's runtime props, this namespace's copy, and the staged form face.
 * @returns the grouped controls and the save.
 */
export function PromptUpgradeSettings(props: PromptUpgradeSettingsProps) {
  const { t } = props
  // One subscription for the whole panel: the projection carries the shell and every
  // field together, so a save or an incoming section settles them at once.
  const state = props.useUpgradeForm((value) => value)
  // Leaving the page drops every staged edit, so an abandoned draft never comes back
  // as if it had been saved.
  const discard = useRef(props.discard)
  discard.current = props.discard
  useEffect(() => () => { discard.current() }, [])

  if (!state.available) {
    return <p className="dsh-pe-notice" role="status">{t('settings.unavailable')}</p>
  }

  const disabled = !state.writable || state.saving
  const copy: FieldCopy = {
    overridden: t('settings.overridden'),
    reset: t('settings.reset'),
    invalid: t('settings.invalid'),
  }
  const sharedFor = (field: UpgradeField): RowShared => ({
    state,
    disabled,
    t,
    copy,
    onEdit: (text) => { props.edit(field, text) },
    onReset: () => { props.resetField(field) },
  })
  const valueRow = (field: UpgradeField, numeric = false) => (
    <ValueRow key={field} field={field} numeric={numeric} shared={sharedFor(field)} />
  )
  const boolRow = (field: UpgradeField) => <BoolRow key={field} field={field} shared={sharedFor(field)} />
  const areaRow = (field: UpgradeField) => <AreaRow key={field} field={field} shared={sharedFor(field)} />
  const blocked = !state.dirty || state.invalid || state.saving

  return (
    <div className="dsh-pe-form">
      {!state.writable
        ? <p className="dsh-pe-notice" role="status">{t('settings.readOnly')}</p>
        : null}
      <fieldset className="dsh-pe-group">
        <legend className="dsh-pe-legend">{t('settings.group.basic')}</legend>
        {boolRow('enabled')}
        {valueRow('shortcut')}
        {boolRow('streaming')}
        {boolRow('contextAware')}
        {valueRow('strategyMode')}
        {areaRow('systemPrompt')}
      </fieldset>
      <fieldset className="dsh-pe-group">
        <legend className="dsh-pe-legend">{t('settings.group.cost')}</legend>
        {valueRow('reasoningEffort')}
        {valueRow('temperature')}
        {valueRow('maxOutputTokens', true)}
        {valueRow('maxInputChars', true)}
        {valueRow('timeoutMs', true)}
        {valueRow('maxConcurrent', true)}
        {valueRow('rateLimitPerMinute', true)}
      </fieldset>
      <fieldset className="dsh-pe-group">
        <legend className="dsh-pe-legend">{t('settings.group.context')}</legend>
        {valueRow('provider')}
        {valueRow('model')}
        {valueRow('contextMaxMessages', true)}
        {valueRow('contextMaxChars', true)}
      </fieldset>
      <div className="dsh-pe-footer">
        {state.failed
          ? <p className="dsh-pe-save-failed" role="status">{t('settings.saveFailed')}</p>
          : null}
        <button type="button" className="dsh-pe-save" disabled={blocked} onClick={() => { props.save() }}>
          {state.saving ? t('settings.saving') : t('settings.save')}
        </button>
      </div>
    </div>
  )
}

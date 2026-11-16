/**
 * Staged form model over the plugin's own settings namespace.
 *
 * The panel edits the same `prompt-upgrade` section the host half reads on every
 * request. Two things are deliberately NOT re-implemented here, because the host
 * already owns them:
 * - **persistence and the revision fence**: `ctx.configForms.get(ns)` hands back a
 *   shared form whose `mutate(ops, revision)` is a revision-fenced document write
 *   with its own read-back recovery. This module only builds the op list.
 * - **the schema**: the section arrives schema-resolved, so a field read is the
 *   user layer over the composition layer over the schema default.
 *
 * What this module does own is staging: the user types into drafts, and only a save
 * turns drafts into ops. That is why an invalid draft can block the save instead of
 * being written and refused by the host with no marker on the field.
 *
 * The official `SettingsFormModel` from `@deepseek-ai/dsh-client-ui-primitives`
 * would have provided the same staging, but that package ships a `lib` build with
 * its own CSS-module imports and an incomplete dependency tree (`clsx`,
 * `@deepseek-ai/dsh-util-workspace-path`), which the plugin build cannot rely on.
 * The harness contract used here is small and stable: the three members below.
 * @module dsh-prompt-upgrade/client/settings-form
 */

import type { Config } from '../config'

/** Sync state of one settings namespace, as the client mirror reports it. */
export interface SettingsScopeSnapshot<T> {
  /** `loading` until the first accepted section, `ready` while one stands, `unavailable` when not served. */
  status: 'loading' | 'ready' | 'unavailable'
  /** Last accepted schema-resolved section, undefined before the first acceptance. */
  value: T | undefined
  /** Composition layer the value resolves over: what a field reverts to once cleared. */
  base: unknown
  /** Raw user layer as stored; a field's PRESENCE here is what marks it overridden. */
  user: unknown
  /** Revision the snapshot was read at. */
  revision: number | undefined
  /** Whether the host document accepts writes. */
  writable: boolean
}

/** One path edit a save sends, as the shared configuration form's `mutate` accepts it. */
export type SettingsOp =
  | { op: 'set'; path: readonly string[]; value: unknown }
  | { op: 'unset'; path: readonly string[] }

/**
 * The entry form this panel stages over.
 *
 * Structural on purpose: `ctx.configForms.get()` returns the harness's own form
 * class, and importing that class's package would tie this half to a package a
 * given profile may not bundle.
 */
export interface SettingsScope<T> {
  /** @returns the current sync snapshot. */
  getSnapshot(): SettingsScopeSnapshot<T>
  /** Observe snapshot replacements. */
  subscribe(listener: () => void): () => void
  /** Apply ordered field edits in one revision-fenced write. */
  mutate(ops: readonly SettingsOp[], expectedRevision?: number): Promise<boolean>
}

/** The write one field's staged text performs when the panel is saved. */
type FieldWrite =
  | { kind: 'set'; value: unknown }
  | { kind: 'clear' }

/** How one section field converts between its stored value and its draft text. */
export interface SettingsFieldSpec {
  /** Field name inside the namespace section. */
  field: string
  /** Render a stored value as draft text; the empty string when the section carries none. */
  format: (value: unknown) => string
  /** The write this draft stages, or undefined when the text is not a value this field accepts. */
  parse: (text: string) => FieldWrite | undefined
}

/** One field as a control renders it. */
export interface SettingsFieldState {
  /** Draft text the control renders. */
  text: string
  /** Whether saving would leave a user-layer entry for this field. */
  overridden: boolean
  /** Whether the draft is not a value this field accepts, which blocks the save. */
  invalid: boolean
}

/** Form state every panel shares. */
export interface SettingsFormShell {
  /** False while the namespace is not served to this client. */
  available: boolean
  /** Whether the host document accepts writes. */
  writable: boolean
  /** Whether the form holds edits a save would write. */
  dirty: boolean
  /** Whether any staged draft is invalid, which blocks the save. */
  invalid: boolean
  /** Whether a save is crossing the wire. */
  saving: boolean
  /** Whether the last save did not land as staged. */
  failed: boolean
}

/** The write actions the panel's slot entry injects. */
export interface SettingsFormActions {
  /** Stage draft text for one field. */
  edit: (field: string, text: string) => void
  /** Stage a clear, so saving lets the field re-inherit the composition layer. */
  resetField: (field: string) => void
  /** Write every staged edit, then re-seed from what the host accepted. */
  save: () => void
  /** Drop every staged edit. */
  discard: () => void
}

/**
 * A minimal snapshot observable: exactly what a slot's hooks compartment needs
 * (`getSnapshot` + `subscribe`) and what React's `useSyncExternalStore` accepts.
 * `getSnapshot` returns the same reference until the projection actually changes,
 * so a re-render only happens on a real state change.
 */
export interface Observable<S> {
  getSnapshot(): S
  subscribe(listener: () => void): () => void
}

/**
 * The section the panel renders: every field of the host `Config`.
 *
 * Re-declared here instead of imported at runtime because the client bundle must not
 * pull the host config module (it would drag `@deepseek-ai/schemastery` into the
 * browser). The compile-time assertion below fails this file's typecheck if the host
 * ever renames or drops a field the panel still reads.
 */
export interface UpgradeSection {
  enabled: boolean
  provider?: string
  model?: string
  temperature: number
  reasoningEffort: string
  maxOutputTokens: number
  maxInputChars: number
  timeoutMs: number
  systemPrompt: string
  strategyMode: string
  shortcut: string
  maxConcurrent: number
  rateLimitPerMinute: number
  streaming: boolean
  contextAware: boolean
  contextMaxMessages: number
  contextMaxChars: number
}

/** Compile-time guarantee: the panel only tracks keys that exist in the host config. */
type AssertMirror = keyof UpgradeSection extends keyof Config ? true : never
const _assertMirror: AssertMirror = true
void _assertMirror

/** Field names the panel exposes, in section order. */
export const FIELDS = [
  'enabled',
  'provider',
  'model',
  'temperature',
  'reasoningEffort',
  'maxOutputTokens',
  'maxInputChars',
  'timeoutMs',
  'systemPrompt',
  'strategyMode',
  'shortcut',
  'maxConcurrent',
  'rateLimitPerMinute',
  'streaming',
  'contextAware',
  'contextMaxMessages',
  'contextMaxChars',
] as const satisfies readonly (keyof UpgradeSection)[]

/** One exposed field name. */
export type UpgradeField = (typeof FIELDS)[number]

/**
 * A boolean field: drafts are exactly `true` or `false`; empty clears the override.
 * @param field - field name inside the namespace section.
 * @returns the field's conversion spec.
 */
export function boolField(field: string): SettingsFieldSpec {
  return {
    field,
    format: (value) => (value === true ? 'true' : value === false ? 'false' : ''),
    parse: (text) => {
      const trimmed = text.trim().toLowerCase()
      if (trimmed === '') return { kind: 'clear' }
      if (trimmed === 'true') return { kind: 'set', value: true }
      if (trimmed === 'false') return { kind: 'set', value: false }
      return undefined
    },
  }
}

/**
 * One of a fixed set of strings; anything else is invalid, so a typo cannot reach a
 * host that would only refuse it at write time.
 * @param field - field name inside the namespace section.
 * @param allowed - the accepted literals.
 * @returns the field's conversion spec.
 */
export function enumField(field: string, allowed: readonly string[]): SettingsFieldSpec {
  return {
    field,
    format: (value) => (typeof value === 'string' ? value : ''),
    parse: (text) => {
      const trimmed = text.trim()
      if (trimmed === '') return { kind: 'clear' }
      return allowed.includes(trimmed) ? { kind: 'set', value: trimmed } : undefined
    },
  }
}

/**
 * A free-text field; an empty draft stages a clear.
 * @param field - field name inside the namespace section.
 * @returns the field's conversion spec.
 */
export function textField(field: string): SettingsFieldSpec {
  return {
    field,
    format: (value) => (typeof value === 'string' ? value : ''),
    parse: (text) => {
      const trimmed = text.trim()
      return trimmed === '' ? { kind: 'clear' } : { kind: 'set', value: trimmed }
    },
  }
}

/**
 * A number field restricted to the host's own range.
 *
 * The bounds mirror `resolveConfig` in the host on purpose: the host is still the
 * authority, but a draft it would refuse is reported on the field instead of as a
 * failed save with no explanation.
 * @param field - field name inside the namespace section.
 * @param min - smallest accepted value, inclusive.
 * @param max - largest accepted value, inclusive.
 * @param integer - whether fractional drafts are refused.
 * @returns the field's conversion spec.
 */
export function boundedNumberField(field: string, min: number, max: number, integer = true): SettingsFieldSpec {
  return {
    field,
    format: (value) => (typeof value === 'number' ? String(value) : ''),
    parse: (text) => {
      const trimmed = text.trim()
      if (trimmed === '') return { kind: 'clear' }
      const parsed = Number(trimmed)
      if (!Number.isFinite(parsed) || parsed < min || parsed > max) return undefined
      if (integer && !Number.isInteger(parsed)) return undefined
      return { kind: 'set', value: parsed }
    },
  }
}

/** The field specs, mirroring the ranges `resolveConfig` enforces in the host. */
const SPECS: readonly SettingsFieldSpec[] = [
  boolField('enabled'),
  textField('provider'),
  textField('model'),
  boundedNumberField('temperature', 0, 1, false),
  enumField('reasoningEffort', ['off', 'low', 'high', 'inherit']),
  boundedNumberField('maxOutputTokens', 256, 32768),
  boundedNumberField('maxInputChars', 200, 200000),
  boundedNumberField('timeoutMs', 5000, 600000),
  textField('systemPrompt'),
  enumField('strategyMode', ['replace-default', 'extend-default']),
  textField('shortcut'),
  boundedNumberField('maxConcurrent', 1, 16),
  boundedNumberField('rateLimitPerMinute', 1, 600),
  boolField('streaming'),
  boolField('contextAware'),
  boundedNumberField('contextMaxMessages', 0, 50),
  boundedNumberField('contextMaxChars', 0, 100000),
]

/** The panel state: the shared shell plus every field's draft. */
export interface UpgradeFormState extends SettingsFormShell {
  enabled: SettingsFieldState
  provider: SettingsFieldState
  model: SettingsFieldState
  temperature: SettingsFieldState
  reasoningEffort: SettingsFieldState
  maxOutputTokens: SettingsFieldState
  maxInputChars: SettingsFieldState
  timeoutMs: SettingsFieldState
  systemPrompt: SettingsFieldState
  strategyMode: SettingsFieldState
  shortcut: SettingsFieldState
  maxConcurrent: SettingsFieldState
  rateLimitPerMinute: SettingsFieldState
  streaming: SettingsFieldState
  contextAware: SettingsFieldState
  contextMaxMessages: SettingsFieldState
  contextMaxChars: SettingsFieldState
}

/** One staged edit: the draft text, or a staged clear. */
interface StagedEdit {
  text: string
  clear: boolean
}

/**
 * Staging over one settings scope.
 *
 * Reads always come from the scope; only drafts live here. `publish()` re-projects
 * for every subscriber after a draft change, a scope change, or a save settlement,
 * so what the panel shows is always "host section + my drafts".
 */
class StagedForm {
  private readonly specs: Map<string, SettingsFieldSpec>
  private readonly staged = new Map<string, StagedEdit>()
  private readonly listeners = new Set<() => void>()
  private readonly unsubscribe: () => void
  private saving = false
  private failed = false

  /** @param scope - the shared configuration form for this panel's namespace. */
  constructor(private readonly scope: SettingsScope<UpgradeSection>, specs: readonly SettingsFieldSpec[]) {
    this.specs = new Map(specs.map((spec) => [spec.field, spec]))
    this.unsubscribe = scope.subscribe(() => { this.publish() })
  }

  /**
   * Publish a projection of this form, rebuilt when a draft or the scope changes.
   * @param project - builds the panel state from the form's current reads.
   * @returns the observable the panel reads through its bound selector.
   */
  bind<S>(project: () => S): Observable<S> {
    let current = project()
    const listeners = new Set<() => void>()
    this.listeners.add(() => {
      current = project()
      for (const listener of listeners) listener()
    })
    return {
      getSnapshot: () => current,
      subscribe: (listener) => {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },
    }
  }

  /** @returns the panel-level state: what the host serves and what a save would do. */
  shell(): SettingsFormShell {
    const snapshot = this.scope.getSnapshot()
    const plan = this.plan()
    return {
      available: snapshot.status === 'ready',
      writable: snapshot.writable,
      dirty: plan.length > 0,
      invalid: plan.some((item) => item.op === undefined),
      saving: this.saving,
      failed: this.failed,
    }
  }

  /**
   * @param field - field name of a section field.
   * @returns the draft text, whether a save would leave an override, and whether it is invalid.
   */
  field(field: string): SettingsFieldState {
    const spec = this.spec(field)
    const staged = this.staged.get(field)
    if (staged === undefined) {
      return { text: spec.format(this.sectionValue(field)), overridden: this.stored(field), invalid: false }
    }
    const write = staged.clear ? { kind: 'clear' as const } : spec.parse(staged.text)
    return { text: staged.text, overridden: write?.kind === 'set', invalid: write === undefined }
  }

  /** @returns the edit, reset, save, and discard actions bound to this form. */
  actions(): SettingsFormActions {
    return {
      edit: (field, text) => {
        this.stage(field, { text, clear: false })
      },
      resetField: (field) => {
        this.stage(field, { text: this.spec(field).format(this.baseValue(field)), clear: true })
      },
      save: () => { void this.save() },
      discard: () => {
        if (this.staged.size === 0 && !this.failed) return
        this.staged.clear()
        this.failed = false
        this.publish()
      },
    }
  }

  /**
   * Write every staged edit, then re-seed from what the host accepted.
   *
   * The host is the only authority on whether a value was accepted, so the outcome
   * is read back from the section rather than predicted here. A save that did not
   * land keeps its drafts, so the user can correct them instead of retyping.
   */
  async save(): Promise<void> {
    const plan = this.plan()
    if (plan.length === 0 || this.saving) return
    if (!this.scope.getSnapshot().writable) return
    if (plan.some((item) => item.op === undefined)) return
    this.saving = true
    this.failed = false
    this.publish()
    try {
      const ops = plan.flatMap((item) => (item.op === undefined ? [] : [item.op]))
      // The revision fence belongs to the shared form: passing no `expectedRevision`
      // lets it carry the latest known revision, which is what this panel read.
      const landed = ops.length === 0 || await this.scope.mutate(ops)
      if (landed) {
        this.staged.clear()
        this.failed = false
      } else {
        this.failed = true
      }
    } catch {
      this.failed = true
    } finally {
      this.saving = false
      this.publish()
    }
  }

  /** Release the scope subscription. */
  dispose(): void {
    try {
      this.unsubscribe()
    } catch {
      // Settings service already released this subscription.
    }
    this.listeners.clear()
  }

  /** Stage one edit and republish. */
  private stage(field: string, edit: StagedEdit): void {
    this.staged.set(field, edit)
    this.publish()
  }

  /** Notify every projection listener. */
  private publish(): void {
    for (const listener of this.listeners) {
      try {
        listener()
      } catch {
        // One broken projection must not stop the others.
      }
    }
  }

  /** The field's spec, or a pass-through spec for an unexpected field name. */
  private spec(field: string): SettingsFieldSpec {
    return this.specs.get(field) ?? { field, format: () => '', parse: (text) => ({ kind: 'set', value: text }) }
  }

  /** The accepted value of one field. */
  private sectionValue(field: string): unknown {
    const value = this.scope.getSnapshot().value
    if (value === undefined) return undefined
    // The section is a plain object once the host resolved it; the cast goes through
    // `unknown` because the declared section type carries no index signature.
    return (value as unknown as Record<string, unknown>)[field]
  }

  /** The composition-layer value of one field, which a clear reverts to. */
  private baseValue(field: string): unknown {
    const base = this.scope.getSnapshot().base
    return base === null || typeof base !== 'object' ? undefined : (base as Record<string, unknown>)[field]
  }

  /** Whether the stored user layer carries this field (presence, not value equality). */
  private stored(field: string): boolean {
    const user = this.scope.getSnapshot().user
    return user !== null && typeof user === 'object' && Object.prototype.hasOwnProperty.call(user, field)
  }

  /** The op for every staged edit; `op: undefined` marks an invalid draft that blocks the save. */
  private plan(): readonly { field: string; op: SettingsOp | undefined }[] {
    return [...this.staged.entries()].map(([field, edit]) => {
      if (edit.clear) return { field, op: { op: 'unset' as const, path: [field] } }
      const write = this.spec(field).parse(edit.text)
      if (write === undefined) return { field, op: undefined }
      return {
        field,
        op: write.kind === 'set'
          ? { op: 'set' as const, path: [field], value: write.value }
          : { op: 'unset' as const, path: [field] },
      }
    })
  }
}

/** What the panel's slot registration injects. */
export interface UpgradePanelInjected extends SettingsFormActions {
  /** The staged panel state, read through the slot's hooks compartment. */
  hooks: { upgradeForm: Observable<UpgradeFormState> }
}

/**
 * The panel's staged form over one settings scope.
 *
 * Every read goes through the shared scope, so the panel never holds a copy of the
 * section: the values shown are the host's current accepted section plus whatever
 * the user has staged on top of it.
 */
export class PromptUpgradeForm {
  private readonly form: StagedForm
  private readonly state: Observable<UpgradeFormState>

  /** @param scope - the shared configuration form for this plugin's namespace. */
  constructor(scope: SettingsScope<UpgradeSection>) {
    this.form = new StagedForm(scope, SPECS)
    this.state = this.form.bind(() => {
      const shell = this.form.shell()
      const projected = { ...shell } as UpgradeFormState
      // Rebuilt from the model on every publish: a field's draft, its override marker
      // and its validity all come from the same staged/diff computation.
      for (const field of FIELDS) projected[field] = this.form.field(field)
      return projected
    })
  }

  /**
   * Build the registration face the panel component consumes.
   * @returns the staged state observable and the shared edit/save actions.
   */
  inject(): UpgradePanelInjected {
    return { hooks: { upgradeForm: this.state }, ...this.form.actions() }
  }

  /** Release the scope subscription held by the staged model. */
  dispose(): void {
    this.form.dispose()
  }
}

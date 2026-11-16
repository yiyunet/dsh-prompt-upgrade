/**
 * The settings panel's staging layer: drafts stay drafts until a save, an invalid
 * draft blocks the save instead of being written and refused, and the override badge
 * follows the stored user layer's PRESENCE rather than a value comparison.
 *
 * These are the behaviours a user notices. The panel itself is React; this module is
 * plain logic on purpose, so it can be pinned without rendering.
 */

import { describe, expect, it } from 'vitest'
import {
  PromptUpgradeForm,
  type SettingsOp,
  type SettingsScope,
  type SettingsScopeSnapshot,
  type UpgradeSection,
} from '../src/client/settings-form'

/** A complete section, matching the host defaults where one exists. */
function section(overrides: Partial<UpgradeSection> = {}): UpgradeSection {
  return {
    enabled: true,
    temperature: 0.3,
    reasoningEffort: 'off',
    maxOutputTokens: 8192,
    maxInputChars: 12000,
    timeoutMs: 60000,
    systemPrompt: '',
    strategyMode: 'replace-default',
    shortcut: 'ctrl+alt+e',
    maxConcurrent: 2,
    rateLimitPerMinute: 10,
    streaming: true,
    contextAware: true,
    contextMaxMessages: 8,
    contextMaxChars: 4000,
    ...overrides,
  }
}

interface Harness {
  scope: SettingsScope<UpgradeSection>
  /** Every mutate() call, in order. */
  calls: SettingsOp[][]
  /** What the next mutate() answers. */
  verdict: { accept: boolean }
  /** Push a new snapshot and notify subscribers. */
  push: (next: Partial<SettingsScopeSnapshot<UpgradeSection>>) => void
}

/** Build a fake settings scope that records writes. */
function harness(initial: Partial<SettingsScopeSnapshot<UpgradeSection>> = {}): Harness {
  const listeners = new Set<() => void>()
  const calls: SettingsOp[][] = []
  const verdict = { accept: true }
  let snapshot: SettingsScopeSnapshot<UpgradeSection> = {
    status: 'ready',
    value: section(),
    base: {},
    user: {},
    revision: 1,
    writable: true,
    ...initial,
  }
  const scope: SettingsScope<UpgradeSection> = {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    mutate: async (ops) => {
      calls.push([...ops])
      return verdict.accept
    },
  }
  const push = (next: Partial<SettingsScopeSnapshot<UpgradeSection>>): void => {
    snapshot = { ...snapshot, ...next }
    for (const listener of listeners) listener()
  }
  return { scope, calls, verdict, push }
}

describe('settings panel: staging', () => {
  it('reads the accepted section until something is staged', () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    const state = form.inject().hooks.upgradeForm.getSnapshot()
    expect(state.available).toBe(true)
    expect(state.writable).toBe(true)
    expect(state.dirty).toBe(false)
    expect(state.maxOutputTokens.text).toBe('8192')
    expect(state.enabled.text).toBe('true')
    form.dispose()
  })

  it('stages an edit without writing anything', () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    form.inject().edit('maxOutputTokens', '4096')
    const state = form.inject().hooks.upgradeForm.getSnapshot()
    expect(state.dirty).toBe(true)
    expect(state.invalid).toBe(false)
    expect(state.maxOutputTokens.text).toBe('4096')
    expect(h.calls).toHaveLength(0)
    form.dispose()
  })

  it('marks an out-of-range number invalid and refuses to save it', () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    form.inject().edit('maxOutputTokens', '999999')
    const state = form.inject().hooks.upgradeForm.getSnapshot()
    expect(state.maxOutputTokens.invalid).toBe(true)
    expect(state.invalid).toBe(true)
    form.inject().save()
    expect(h.calls).toHaveLength(0)
    form.dispose()
  })

  it('refuses a fractional draft for an integer field but takes it for temperature', () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    const actions = form.inject()
    actions.edit('maxOutputTokens', '1024.5')
    expect(form.inject().hooks.upgradeForm.getSnapshot().maxOutputTokens.invalid).toBe(true)
    actions.edit('temperature', '0.45')
    expect(form.inject().hooks.upgradeForm.getSnapshot().temperature.invalid).toBe(false)
    form.dispose()
  })

  it('refuses an unknown enum literal', () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    form.inject().edit('reasoningEffort', 'maximum')
    expect(form.inject().hooks.upgradeForm.getSnapshot().reasoningEffort.invalid).toBe(true)
    form.dispose()
  })

  it('accepts only true/false for a boolean field', () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    const actions = form.inject()
    actions.edit('enabled', 'yes')
    expect(form.inject().hooks.upgradeForm.getSnapshot().enabled.invalid).toBe(true)
    actions.edit('enabled', 'false')
    expect(form.inject().hooks.upgradeForm.getSnapshot().enabled.invalid).toBe(false)
    expect(form.inject().hooks.upgradeForm.getSnapshot().enabled.text).toBe('false')
    form.dispose()
  })
})

describe('settings panel: saving', () => {
  it('writes every staged edit as one mutation and clears the drafts', async () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    const actions = form.inject()
    actions.edit('maxOutputTokens', '4096')
    actions.edit('shortcut', 'ctrl+alt+u')
    form.inject().save()
    // save() is async fire-and-forget from the action; settle the microtask queue.
    await Promise.resolve()
    await Promise.resolve()
    expect(h.calls).toHaveLength(1)
    expect(h.calls[0]).toEqual([
      { op: 'set', path: ['maxOutputTokens'], value: 4096 },
      { op: 'set', path: ['shortcut'], value: 'ctrl+alt+u' },
    ])
    expect(form.inject().hooks.upgradeForm.getSnapshot().dirty).toBe(false)
    form.dispose()
  })

  it('keeps the drafts and reports failure when the host refuses', async () => {
    const h = harness()
    h.verdict.accept = false
    const form = new PromptUpgradeForm(h.scope)
    form.inject().edit('maxOutputTokens', '4096')
    form.inject().save()
    await Promise.resolve()
    await Promise.resolve()
    const state = form.inject().hooks.upgradeForm.getSnapshot()
    expect(state.failed).toBe(true)
    expect(state.dirty).toBe(true)
    expect(state.maxOutputTokens.text).toBe('4096')
    form.dispose()
  })

  it('does not write while the document is read-only', async () => {
    const h = harness({ writable: false })
    const form = new PromptUpgradeForm(h.scope)
    form.inject().edit('maxOutputTokens', '4096')
    form.inject().save()
    await Promise.resolve()
    expect(h.calls).toHaveLength(0)
    form.dispose()
  })

  it('stages a clear when a field is reset, and writes it as unset', async () => {
    const h = harness({ user: { maxOutputTokens: 4096 } })
    const form = new PromptUpgradeForm(h.scope)
    form.inject().resetField('maxOutputTokens')
    form.inject().save()
    await Promise.resolve()
    await Promise.resolve()
    expect(h.calls[0]).toEqual([{ op: 'unset', path: ['maxOutputTokens'] }])
    form.dispose()
  })

  it('drops every staged edit on discard', () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    form.inject().edit('maxOutputTokens', '4096')
    form.inject().discard()
    const state = form.inject().hooks.upgradeForm.getSnapshot()
    expect(state.dirty).toBe(false)
    expect(state.maxOutputTokens.text).toBe('8192')
    form.dispose()
  })
})

describe('settings panel: override marker', () => {
  it('marks a field overridden by presence in the user layer, not by value', () => {
    // An override equal to the composition default is still an override.
    const h = harness({ user: { maxOutputTokens: 8192 } })
    const form = new PromptUpgradeForm(h.scope)
    const state = form.inject().hooks.upgradeForm.getSnapshot()
    expect(state.maxOutputTokens.overridden).toBe(true)
    expect(state.shortcut.overridden).toBe(false)
    form.dispose()
  })

  it('follows an incoming section from the host', () => {
    const h = harness()
    const form = new PromptUpgradeForm(h.scope)
    expect(form.inject().hooks.upgradeForm.getSnapshot().maxOutputTokens.text).toBe('8192')
    h.push({ value: section({ maxOutputTokens: 2048 }), revision: 2 })
    expect(form.inject().hooks.upgradeForm.getSnapshot().maxOutputTokens.text).toBe('2048')
    form.dispose()
  })

  it('reports the namespace as unavailable when the host does not serve it', () => {
    const h = harness({ status: 'unavailable' })
    const form = new PromptUpgradeForm(h.scope)
    expect(form.inject().hooks.upgradeForm.getSnapshot().available).toBe(false)
    form.dispose()
  })
})

/**
 * Browser half of the prompt-upgrade plugin: registers the composer
 * enhance button (conversation.input.right), the undo bar
 * (conversation.input.dock), the zh/en dictionaries, the settings mirror,
 * and the configurable global shortcut. Failure policy mirrors the
 * describe-image family: every optional wiring failure is caught and
 * logged-never-thrown, because the web shell fails the whole boot when a
 * plugin apply throws.
 *
 * The slot services themselves are reached through a structural face rather
 * than a package type: dsh 0.2.x moved the `slots` service out of
 * `@deepseek-ai/dsh-client-ui-slots` (which now only ships the contract
 * types), and a hard type import of the old home would tie this half to a
 * package the runtime no longer ships.
 * @module dsh-prompt-upgrade/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Side-effect type imports: these packages declare the standard-props members
// this half reads (`sessionId` on SessionStandardProps) and the selector hook
// types the props resolve to. Without them those members type as `any`, which
// is how a rename in the host silently degrades to untyped reads.
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-store'
import { EnhanceButton } from './EnhanceButton'
import { UndoBar } from './UndoBar'
import * as ui from './ui-state'
import { dictionaries, NS } from './locales'
import { ensureStyles } from './styles'
import { matchesShortcut, parseShortcut } from './shortcut'
import { decodeClientSettings, getClientSettings, setClientSettings } from './settings'
import { installClientSettingsSource } from './settings-source'
import { PROMPT_ENHANCE_ROW_IDS } from '../shared/protocol'
import { guardShell, SHELL_SLOT } from './anb-shell.mjs'
import { PromptUpgradeForm } from './settings-form'
import type { UpgradeSection } from './settings-form'
import { PromptUpgradeSettings } from './PromptUpgradeSettings'
import type { SettingsScope } from './settings-form'

/** Locale namespace of the browser half. */
export { NS }

/** Structural face of the slot registry this half registers into. */
interface SlotsFace {
  inject(name: string, callback: () => unknown): unknown
  register(spec: { name: string; id: string; order?: number; locale?: string }, component: unknown): () => void
}

/**
 * Structural face of the per-entry configuration forms service.
 *
 * Typed structurally rather than imported: `ctx.configForms` is reached through
 * `ctx.inject`, and a hard type import would tie this half to a package a given
 * profile may not bundle (the same reason every other service here is probed).
 */
interface ConfigFormsFace {
  /** The shared form for one entry id, when the host serves it. */
  get?: (entryId: string) => unknown
  /**
   * Run `register` while every named namespace is served, re-running it when the
   * served set changes. Returns the disposer that unmounts the contribution.
   */
  whileServed?: (
    namespaces: readonly string[],
    register: (served: ReadonlySet<string>) => () => void,
  ) => () => void
}

// No hard service dependencies. Every service this half touches (`configForms`
// / the aggregate `webUiSettings` binder / the legacy `settingsScope`, plus
// `slots` and `locale` from the UI packages a given profile may or may not
// bundle) is reached through `ctx.inject`, which starts the wiring only if and
// when the service actually mounts. A service named here instead would make
// this entry sit `pending` forever on a profile that lacks it — and DSH treats
// a pending entry as a boot failure ("web boot: 1 entry did not activate"),
// taking the whole GUI down with it.
// The cost of that choice is degraded, never broken: a profile with no settings
// surface keeps the bundled default mirror, and one with no locale service
// renders dictionary keys instead of copy.
export const inject: string[] = []

/**
 * Report one failed optional wiring step and keep booting.
 *
 * The policy is catch-and-never-throw — a throw from `apply` fails the whole
 * web boot — but a silent catch made every "the button is not there" report
 * undebuggable: nothing in the browser console, nothing in the host log, and
 * the failure mode is indistinguishable from "this profile does not bundle
 * the service". Log one bounded line per failure and still hand back a no-op
 * disposer so callers stay uniform.
 * @param step - the wiring step that failed, named as the user sees it.
 * @param error - the thrown value, logged as-is.
 * @returns a no-op disposer.
 */
function report(step: string, error: unknown): () => void {
  try {
    console.warn(`[prompt-upgrade] ${step} failed; that feature stays off.`, error)
  } catch {
    // A throwing console (a proxied one, or a locked-down shell) must not turn
    // a degraded feature into a failed boot.
  }
  return () => {}
}

/** Apply the browser half. */
export function apply(ctx: ClientContext): void {
  ensureStyles()

  // Dictionaries arrive with the locale service, which is optional here: a
  // profile without it renders dictionary keys instead of localized copy, but
  // the plugin must not block boot over that.
  ctx.inject(['locale'], (localeCtx: ClientContext) => {
    ctx.effect(() => {
      try {
        return localeCtx.locale.register(NS, dictionaries)
      } catch (error) {
        return report('dictionary registration', error)
      }
    }, 'dsh-prompt-upgrade: dictionaries')
  })

  // Baseline before anything optional mounts: the bundled mirror equals the
  // host `DEFAULT_CONFIG`, so a profile without a settings surface still gets
  // a working button, guards, and shortcut instead of an unset mirror.
  setClientSettings(decodeClientSettings(undefined))

  // The settings mirror: re-read on every committed change so the button, the
  // guards, and the shortcut follow Settings → 插件配置 live. The source
  // probes the 0.2.x config form first, then the aggregate binder, then the
  // legacy scope — see ./settings-source.
  installClientSettingsSource(ctx, {
    rowIds: PROMPT_ENHANCE_ROW_IDS,
    onSection: (section) => setClientSettings(decodeClientSettings(section)),
  })

  ctx.inject(['slots'], (slotsCtx: ClientContext) => {
    const slots = (slotsCtx as unknown as { slots?: SlotsFace }).slots
    if (slots === undefined) return
    return slots.inject('conversation.input.right', () => {
      try {
        return slots.register(
          { name: 'conversation.input.right', id: 'prompt-upgrade', order: 60, locale: NS },
          EnhanceButton as unknown as never,
        )
      } catch (error) {
        return report('composer enhance button slot', error)
      }
    })
  })

  ctx.inject(['slots'], (slotsCtx: ClientContext) => {
    const slots = (slotsCtx as unknown as { slots?: SlotsFace }).slots
    if (slots === undefined) return
    return slots.inject('conversation.input.dock', () => {
      try {
        return slots.register(
          { name: 'conversation.input.dock', id: 'prompt-upgrade-undo', order: 90, locale: NS },
          UndoBar as unknown as never,
        )
      } catch (error) {
        return report('undo bar slot', error)
      }
    })
  })

  // The configurable shortcut: acts on the composer the user is working in;
  // never swallows keys unless the exact combo matches.
  ctx.effect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.isComposing) return
      const settings = getClientSettings()
      // Master switch off means this plugin has no claim on the keyboard. The
      // old code still matched, prevented the default and ran a no-op target,
      // so turning the plugin off silently broke whichever host shortcut the
      // user had bound to the same combo, with nothing to explain it.
      if (!settings.enabled) return
      const combo = parseShortcut(settings.shortcut)
      if (!matchesShortcut(event, combo)) return
      const target = ui.shortcutTarget()
      if (target === undefined) return
      event.preventDefault()
      event.stopPropagation()
      target()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, 'dsh-prompt-upgrade: shortcut')

  // ── 设置面板：挂「ANB 工具」壳（N29 · 老板 2026-10-30 令）───────────────
  // 面板注册进壳独占的 `anb.tool.tab`，由壳统一注册 `settings.section`（id
  // `anb-toolbox`，order 16）——本插件**不**自注册 settings.section、也不自带
  // 页面标题，设置里因此只有「ANB 工具」一个入口。
  // `guardShell` 幂等：已有兄弟 ANB 插件登记壳就让位，那位被禁用后自动接管。
  //
  // namespace 取 `PROMPT_ENHANCE_ROW_IDS[0]`，两半共用同一份常量，宿主 section
  // 与浏览器镜像不会解析到两个不同的文档。
  ctx.inject(['slots', 'configForms'], (wired: ClientContext) => {
    const face = wired as unknown as { slots?: SlotsFace; configForms?: ConfigFormsFace }
    const slots = face.slots
    const forms = face.configForms
    if (slots === undefined || forms === undefined) return
    if (typeof forms.get !== 'function' || typeof forms.whileServed !== 'function') return
    const namespace = PROMPT_ENHANCE_ROW_IDS[0]
    if (namespace === undefined) return
    return ctx.effect(() => {
      try {
        guardShell(wired)
      } catch (error) {
        return report('anb tool shell', error)
      }
      // 命名空间被宿主暴露时才挂载：宿主不服务它时面板根本不出现，而不是渲染
      // 一堆写不进去的控件。
      const stopServing = forms.whileServed?.([namespace], () => {
        const scope = forms.get?.(namespace) as SettingsScope<UpgradeSection> | undefined
        if (scope === undefined) return () => {}
        const form = new PromptUpgradeForm(scope)
        const off = slots.inject(SHELL_SLOT, () => {
          try {
            return slots.register({
              name: SHELL_SLOT,
              id: 'anb.tool.prompt-upgrade',
              order: 50,
              locale: NS,
              // 标签由壳渲染成一行 tab。与壳自己的固定标题（SHELL_TITLE）同策略，
              // 这里给静态文案：locale 服务在本半是可选依赖，缺了也不该空一行。
              label: () => '提示词升级',
              inject: () => form.inject(),
            } as never, PromptUpgradeSettings as unknown as never)
          } catch (error) {
            return report('settings panel slot', error)
          }
        }) as (() => void) | undefined
        return () => {
          try {
            off?.()
          } catch {
            // slot registry already released this entry
          }
          form.dispose()
        }
      })
      return () => {
        try {
          stopServing?.()
        } catch {
          // settings service already gone
        }
      }
    }, 'dsh-prompt-upgrade: anb tool tab')
  })
}

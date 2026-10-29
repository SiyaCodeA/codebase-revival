<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Each AI tool's logic lives in its own function in `src/lib/ai/features.ts`; replace one at a time to enable a feature without touching UI (keeps features independently upgradable).
- Tool pages share `src/components/app/feature-tool.tsx` for form/loading/error/output states; app shell (sidebar) lives in `__root.tsx`.
- Never show fabricated AI output; unconnected features must surface `AINotConnectedError`.
- Live AI features call Lovable AI Gateway from server-only `*.server.ts` modules via a `createServerFn` in `*.functions.ts`; shared input schemas live in `*.schema.ts` (keeps the API key off the client).

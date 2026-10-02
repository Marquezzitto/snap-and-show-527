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

- Keep the Marks Imports logo as a static file under `public/` so custom-domain deployments can serve it without editor-only asset URLs.
- Keep catalog products on dedicated `/produto/$productId` routes with distributor-image fallback, so each item has a direct link even without gallery photos.
- Send store notifications from server code through the linked Resend connector, so mail credentials never enter the browser.
- Keep verified product galleries and color-specific image mappings in shared catalog data, so the listing and product page display the same correct variant.
- Keep administrator catalog edits as role-protected overrides on the original catalog and revalidate prices during server-side checkout, so product pages, carts, and orders agree without replacing source products.
- Keep this storefront web-only until app installation is explicitly requested again, so no service worker or offline cache can serve stale prices or inventory.

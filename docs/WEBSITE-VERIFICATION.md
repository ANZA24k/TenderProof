# Website verification — public hosting update 2026-10-21

- Public reviewer URL: https://fanciful-blini-025faa.netlify.app/
- Netlify project: `d0585286-e187-46c0-bd6c-0cf48329d136`; published deployment: `6ad86edd9b36b329264c3f2f`.
- Uploaded the static production build and explicitly made this project public. Other projects and team defaults were not changed.
- An independent HTTP request without authentication returned 200. Browser verification rendered the frontend, wallet controls, deployment address, and recorded pilot outcome without a sign-in page.
- Build and all ten wallet/UI tests passed for this frontend. This hosting update does not change the deployed Intelligent Contract or establish additional live-contract test results.

## Previous verification — 2026-10-08

- ChatGPT Sites returned `succeeded` for the production publication at https://tenderproof.ansaf1st34.chatgpt.site.
- That older ChatGPT Sites publication was owner-private and is superseded by the public Netlify reviewer URL above.
- Static website build passed (`npm run build`).
- All ten wallet and UI tests passed (`npm test`), including missing provider, address validation, network switching/addition, account revocation, network change, rejected/pending requests, listener cleanup, disconnect during a pending connection, and read-only browser tool state/cleanup.
- All 18 direct-mode contract tests passed (`python -m pytest -q`). These mock external fetch and LLM responses; they are not proof of real validator consensus.
- MetaMask connection code is implemented. A real user extension connection and signature were not tested in the cloud browser. No signature or payment request is made by the website.
- TenderProof was deployed in Studio after the user's follow-up authorization. Its deployment transaction finalized. Genuine creation, commitment, reveal, and evaluation receipts are recorded in the pilot JSON; see LIVE-PILOT.md for the INCONCLUSIVE verdict and scope limits.
- Old GitHub Pages publication was removed. The original hosting used ChatGPT Sites; the current public reviewer deployment uses Netlify.

Remaining verification: passing real semantic review, distinct applicants, challenge/recheck, funded award settlement, and real MetaMask extension interaction. The reviewer website connects the wallet but does not send contract transactions. Deployment and a zero-value fail-closed pilot are not proof that these remaining flows work.

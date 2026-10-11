# Beta releases

The `Beta release` GitHub Actions workflow builds Windows and macOS installers when a version tag matching `v*-beta*` is pushed. It creates a GitHub pre-release and attaches Windows, Apple silicon macOS, and Intel macOS downloads.

## Publish a beta

1. Set the same beta version in `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` (for example, `0.1.0-beta.1`).
2. Commit the version changes, then create and push the matching tag:

   ```sh
   git tag v0.1.0-beta.1
   git push origin v0.1.0-beta.1
   ```

3. Once the workflow completes, find the pre-release and installer links on the repository's GitHub Releases page. The landing page can link directly to that release or its individual assets.

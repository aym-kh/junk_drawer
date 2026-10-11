# Beta releases

The `Beta release` GitHub Actions workflow builds Windows and macOS installers when a version tag matching `*-beta*` is pushed. It creates a GitHub pre-release and attaches a Windows NSIS `.exe` installer and Apple silicon and Intel macOS `.dmg` installers. Windows uses NSIS because MSI requires numeric-only prerelease version identifiers.

## Publish a beta

1. Set the same beta version in `package.json`, `package-lock.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and `src-tauri/Cargo.lock` (for example, `0.1.0-beta.1`).
2. Commit the version changes, then create and push the matching tag:

   ```sh
   git tag 0.1.0-beta.1
   git push origin 0.1.0-beta.1
   ```

3. Once the workflow completes, find the pre-release and installer links on the repository's GitHub Releases page. The landing page can link directly to that release or its individual assets.

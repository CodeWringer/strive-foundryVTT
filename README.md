# STRIVE FoundryVTT System

This is the **STRIVE** table-top role-playing game system for FoundryVTT. 

See also the companion repository that contains the ruleset: https://github.com/CodeWringer/strive-ttrpg

# Build & Deploy
1. Create a new `Migrator`, which will sync any loaded world's version to the new system version. 
2. Increase the `version` number in the `system.json` on branch `develop`. 
3. Create a new **signed** tag on branch `develop` with the corresponding version, using the semantic versioning scheme `vMAJOR.MINOR.PATCH`, e. g. `v1.3.2`. 
4. Run npm script `build`, then upload the resulting `build/system.json` and `build/system.zip` to a new release on GitHub, whose name is the version name, e. g. `v1.3.2`. 
5. Create a pull request to merge `develop` into branch `main`. 

# Credit
* FontAwesome v5 (Free)
  * https://fontawesome.com/license#license
  * Assets:
    * weight-hanging (altered)
    * trash-solid (altered)
    * external-link-alt-solid (altered)
    * comments-solid (altered)
    * dice-three-solid (altered)
    * hashtag-solid (altered)
    * times-circle-solid (altered)
    * hand-holding-solid (altered)
    * caret-up-solid (altered)
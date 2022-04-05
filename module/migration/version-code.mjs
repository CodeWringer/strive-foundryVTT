/**
 * Represents a version code, with major, minor and patch version numbers. 
 * @property {Number | undefined} major This indicates a critical, breaking change. 
 * @property {Number | undefined} minor This indicates a significant change or new feature. 
 * @property {Number | undefined} patch This indicates a smaller change, with little impact. 
 */
export default class VersionCode {
  constructor(major, minor, patch) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  static fromString(version) {
    const versionCodes = version.split(".");
    return new VersionCode(parseInt(versionCodes[0]), parseInt(versionCodes[1]), parseInt(versionCodes[2]));
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}

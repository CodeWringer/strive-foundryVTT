/**
 * Represents a version code, with major, minor and patch version numbers. 
 * @property {Number | undefined} major This indicates a critical, breaking change. 
 * @property {Number | undefined} minor This indicates a significant change or new feature. 
 * @property {Number | undefined} patch This indicates a smaller change, with little impact. 
 */
export default class VersionCode {
  /**
   * @param {Number | undefined} major This indicates a critical, breaking change. 
   * @param {Number | undefined} minor This indicates a significant change or new feature. 
   * @param {Number | undefined} patch This indicates a smaller change, with little impact. 
   */
  constructor(major, minor, patch) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  /**
   * Returns a new instance of {VersionCode}, parsed from the given string. 
   * @param {String} version A version string, in the form "major.minor.patch"
   * @returns {VersionCode}
   */
  static fromString(version) {
    const versionCodes = version.split(".");
    return new VersionCode(parseInt(versionCodes[0]), parseInt(versionCodes[1]), parseInt(versionCodes[2]));
  }

  /**
   * Returns a string representation of this {VersionCode}, in the form "major.minor.patch". 
   * @returns {String}
   */
  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  /**
   * Returns true, if this version code is greater than the given version code. 
   * 
   * @param {VersionCode} otherVersion The version code to compare against. 
   * 
   * @returns `true`, if this version code is greater than the given version code. 
   */
  greaterThan(otherVersion) {
    return this.major > otherVersion.major
      || this.minor > otherVersion.minor
      || this.patch > otherVersion.patch;
  }

  /**
   * Returns true, if this version code is lesser than the given version code. 
   * 
   * @param {VersionCode} otherVersion The version code to compare against. 
   * 
   * @returns `true`, if this version code is lesser than the given version code. 
   */
  lesserThan(otherVersion) {
    return this.major < otherVersion.major
      || this.minor < otherVersion.minor
      || this.patch < otherVersion.patch;
  }

  /**
   * Returns true, if this version code is equal to the given version code. 
   * 
   * @param {VersionCode} otherVersion The version code to compare against. 
   * 
   * @returns `true`, if this version code is equal to the given version code. 
   */
  equals(otherVersion) {
    return this.major === otherVersion.major
      && this.minor === otherVersion.minor
      && this.patch === otherVersion.patch;
  }
}

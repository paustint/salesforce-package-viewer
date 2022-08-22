// AUTH / API
export const API_VERSION = process.env.API_VERSION || '55.0';
export const CLIENT_ID = process.env.CLIENT_ID || '';

// QUERIES
export const QUERY_PACKAGE2_VERSIONS = `SELECT Id, Name, CodeCoverage, CreatedDate,
HasMetadataRemoved, HasPassedCodeCoverageCheck, InstallKey, IsDeprecated, IsPasswordProtected,
IsReleased, LastModifiedDate, MajorVersion, MinorVersion,
Package2Id, PatchVersion, ReleaseVersion, Tag, ValidationSkipped,
Package2.Id, Package2.Name,
SubscriberPackageVersion.Id
FROM Package2Version
ORDER BY MajorVersion Desc, MinorVersion Desc`;

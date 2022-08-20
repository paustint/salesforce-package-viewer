// AUTH / API
export const API_VERSION = '55.0';
export const CLIENT_ID = '3MVG9p1Q1BCe9GmDxw.U9y3e.da7uyWT3Ia4YYpsguCOcDZoJ6joTxtU42NIAwTeFK6mAw8l41JvFBuKfAhiO';

// QUERIES
export const QUERY_PACKAGE2_VERSIONS = `SELECT Id, Name, CodeCoverage, CreatedDate,
HasMetadataRemoved, HasPassedCodeCoverageCheck, InstallKey, IsDeprecated, IsPasswordProtected,
IsReleased, LastModifiedDate, MajorVersion, MinorVersion,
Package2Id, PatchVersion, ReleaseVersion, Tag, ValidationSkipped,
Package2.Id, Package2.Name,
SubscriberPackageVersion.Id
FROM Package2Version
ORDER BY MajorVersion Desc, MinorVersion Desc`;

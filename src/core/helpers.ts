import {Ad} from "@/core/interfaces/Ad";
import {AdVersion} from "@/core/interfaces/AdVersion";

export const getCurrentAdVersionFor = (ad: Ad): AdVersion => {
  const sortedVersions = [...ad.versions].sort((a, b) => b.versionNumber - a.versionNumber);

  const pendingVersion = sortedVersions.find(version => version.status === 'pending');
  if (pendingVersion) return pendingVersion;

  const approvedVersion = sortedVersions.find(version => version.status === 'approved');
  if (approvedVersion) return approvedVersion;

  return sortedVersions.find(version => version.status === 'rejected')!;
};

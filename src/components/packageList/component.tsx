import { Package2Version } from '@src/types';
import React, { useEffect, useState } from 'react';
import { PackageListItem } from './PackageListItem';

export function PackageList({ packages = [] }: { packages: Package2Version[] }) {
  const [showAll, setShowAll] = useState(false);
  const [visiblePackage, setVisiblePackages] = useState(packages);

  useEffect(() => {
    setVisiblePackages(showAll ? packages : packages.slice(0, 3));
  }, [packages, showAll]);

  if (!packages?.length) {
    return null;
  }

  return (
    <div>
      <div className="flow-root mt-3">
        <ul role="list" className="">
          {visiblePackage.map((item, i) => (
            <li key={item.Id} className="rounded-lg border border-gray-300 bg-white mb-2 px-4 py-4 shadow-sm">
              <PackageListItem item={item} isFirst={i === 0} />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          {showAll ? 'View less' : 'View all'}
        </button>
      </div>
    </div>
  );
}

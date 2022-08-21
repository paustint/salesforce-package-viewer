import { BadgeCheckIcon, ClipboardCopyIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/solid';
import { Package2Version } from '@src/types';
import formatDate from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import React, { useEffect, useState } from 'react';
import { Badge } from '../badge/component';

export function PackageListItem({ item, isFirst }: { item: Package2Version; isFirst?: boolean }) {
  const [copied, setCopied] = useState(false);

  const createdDate = formatDate(parseISO(item.CreatedDate), 'MMM d, y h:m a');
  const title = `v${item.MajorVersion}.${item.MinorVersion}.${item.PatchVersion}`;
  const link = `/packagingSetupUI/ipLanding.app?apvId=${item.SubscriberPackageVersion.Id}`;
  const LockIcon = item.IsPasswordProtected ? LockClosedIcon : LockOpenIcon;

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  function copyToClipboard() {
    navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <div className="relative">
      <h3 className="text-sm font-semibold text-gray-800 flex justify-between align-middle">
        <span className="flex">
          {title}
          <span
            className="ml-1 align-middle"
            title={item.IsPasswordProtected ? 'Password Protected' : 'Not password protected'}
          >
            <LockIcon className="mt-1 h-3 w-3" />
          </span>
          <span className="ml-1">
            {item.IsReleased ? <Badge type="success">RELEASED</Badge> : <Badge type="error">BETA</Badge>}
          </span>
          {isFirst && (
            <span className="ml-1">
              <Badge type="new" className="ml-2 flex">
                <BadgeCheckIcon className="mr-1 h-3 w-3" />
                NEWEST
              </Badge>
            </span>
          )}
        </span>
        <span className="font-light">{createdDate}</span>
      </h3>
      {item?.Package2?.Name && <p className="mt-1 font-semibold">{item.Package2.Name}</p>}
      <button
        className="mt-2 text-sm text-gray-600 flex cursor-pointer hover:underline"
        onClick={copyToClipboard}
        title="Copy to clipboard"
      >
        <div>{link}</div>
        {!copied ? (
          <ClipboardCopyIcon className="ml-1 h-5 w-5 text-gray-400" />
        ) : (
          <Badge className="ml-1 hover:no-underline no-underline">copied</Badge>
        )}
      </button>
    </div>
  );
}

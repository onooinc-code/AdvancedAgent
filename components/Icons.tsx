import React from 'react';

// Import all custom icon components
import { MenuIcon as CustomMenuIcon } from './icons/MenuIcon.tsx';
import { EditIcon as CustomEditIcon } from './icons/EditIcon.tsx';
import { CheckIcon as CustomCheckIcon } from './icons/CheckIcon.tsx';
import { SparklesIcon as CustomSparklesIcon } from './icons/SparklesIcon.tsx';
import { SettingsIconV2 } from './icons/SettingsIconV2.tsx';
import { UsersIconV2 } from './icons/UsersIconV2.tsx';
import { CloudIcon as CustomCloudIcon } from './icons/CloudIcon.tsx';
import { PowerIcon as CustomPowerIcon } from './icons/PowerIcon.tsx';
import { HistoryIconV2 } from './icons/HistoryIconV2.tsx';
import { BookmarkIcon as CustomBookmarkIcon } from './icons/BookmarkIcon.tsx';
import { BookmarkFilledIcon as CustomBookmarkFilledIcon } from './icons/BookmarkFilledIcon.tsx';
import { CopyIcon as CustomCopyIcon } from './icons/CopyIcon.tsx';
import { TrashIcon as CustomTrashIcon } from './icons/TrashIcon.tsx';
import { RegenerateIcon as CustomRegenerateIcon } from './icons/RegenerateIcon.tsx';
import { SummarizeIcon as CustomSummarizeIcon } from './icons/SummarizeIcon.tsx';
import { RewriteIcon as CustomRewriteIcon } from './icons/RewriteIcon.tsx';
import { CodeBracketIcon } from './icons/CodeBracketIcon.tsx';
import { SitemapIcon } from './icons/SitemapIcon.tsx';
import { AlignLeftIcon as CustomAlignLeftIcon } from './icons/AlignLeftIcon.tsx';
import { AlignRightIcon as CustomAlignRightIcon } from './icons/AlignRightIcon.tsx';
import { ZoomInIcon as CustomZoomInIcon } from './icons/ZoomInIcon.tsx';
import { ZoomOutIcon as CustomZoomOutIcon } from './icons/ZoomOutIcon.tsx';
import { TextDirectionRightIcon } from './icons/TextDirectionRightIcon.tsx';
import { TextDirectionLeftIcon } from './icons/TextDirectionLeftIcon.tsx';
import { TokenIcon as CustomTokenIcon } from './icons/TokenIcon.tsx';
import { PlusIcon as CustomPlusIcon } from './icons/PlusIcon.tsx';
import { SearchIcon as CustomSearchIcon } from './icons/SearchIcon.tsx';
import { CloseIcon as CustomCloseIcon } from './icons/CloseIcon.tsx';
import { AttachmentIcon as CustomAttachmentIcon } from './icons/AttachmentIcon.tsx';
import { SendIcon as CustomSendIcon } from './icons/SendIcon.tsx';
import { CpuChipIcon } from './icons/CpuChipIcon.tsx';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { ChartBarIcon } from './icons/ChartBarIcon.tsx';
import { MessageCountIcon as CustomMessageCountIcon } from './icons/MessageCountIcon.tsx';


// Re-export them with the original names to avoid changing all import sites.
// This refactor completes the move to custom icons, which are more visually appealing and robust.
export const MenuIcon = CustomMenuIcon;
export const EditIcon = CustomEditIcon;
export const CheckIcon = CustomCheckIcon;
export const SparklesIcon = CustomSparklesIcon;
export const SettingsIcon = SettingsIconV2;
export const UsersIcon = UsersIconV2;
export const CloudIcon = CustomCloudIcon;
export const PowerIcon = CustomPowerIcon;
export const HistoryIcon = HistoryIconV2;
export const BookmarkIcon = CustomBookmarkIcon;
export const BookmarkFilledIcon = CustomBookmarkFilledIcon;

export const CopyIcon = CustomCopyIcon;
export const TrashIcon = CustomTrashIcon;
export const RegenerateIcon = CustomRegenerateIcon;
export const SummarizeIcon = CustomSummarizeIcon;
export const RewriteIcon = CustomRewriteIcon;
export const CodeIcon = CodeBracketIcon;
export const WorkflowIcon = SitemapIcon;
export const AlignLeftIcon = CustomAlignLeftIcon;
export const AlignRightIcon = CustomAlignRightIcon;
export const ZoomInIcon = CustomZoomInIcon;
export const ZoomOutIcon = CustomZoomOutIcon;
export const TextLtrIcon = TextDirectionLeftIcon;
export const TextRtlIcon = TextDirectionRightIcon;
export const TokenIcon = CustomTokenIcon;

export const PlusIcon = CustomPlusIcon;
export const SearchIcon = CustomSearchIcon;
export const CloseIcon = CustomCloseIcon;
export const AttachmentIcon = CustomAttachmentIcon;
export const SendIcon = CustomSendIcon;
export const CpuIcon = CpuChipIcon;
export const PlanIcon = ClipboardListIcon;
export const StatsIcon = ChartBarIcon;
export const MessageCountIcon = CustomMessageCountIcon;
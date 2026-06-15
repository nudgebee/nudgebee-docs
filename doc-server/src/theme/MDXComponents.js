import MDXComponents from '@theme-original/MDXComponents';
import {Community, Enterprise, Cloud} from '@site/src/components/EditionBadge';

// Register the edition badges globally so any .md/.mdx page can use
// <Community/>, <Enterprise/>, or <Cloud/> without an explicit import.
export default {
  ...MDXComponents,
  Community,
  Enterprise,
  Cloud,
};

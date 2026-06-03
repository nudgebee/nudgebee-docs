import React from 'react';
import {Redirect} from 'react-router-dom';

// The site has no standalone landing page — the documentation itself is the
// home. Redirect the root URL straight to the docs.
export default function Home(): JSX.Element {
  return <Redirect to="/docs/" />;
}

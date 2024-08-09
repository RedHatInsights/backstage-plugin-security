import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { SecurityFrontendPlugin, EntitySecurityFrontendContent } from '../src/plugin';

createDevApp()
  .registerPlugin(SecurityFrontendPlugin)
  .addPage({
    element: <EntitySecurityFrontendContent />,
    title: 'Root Page',
    path: '/security-frontend',
  })
  .render();

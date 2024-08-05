import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { SecurityPlugin, EntitySecurityContent } from '../src/plugin';

createDevApp()
  .registerPlugin(SecurityPlugin)
  .addPage({
    element: <EntitySecurityContent />,
    title: 'Root Page',
    path: '/security',
  })
  .render();

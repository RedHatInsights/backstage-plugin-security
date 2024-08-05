import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

export const SecurityPlugin = createPlugin({
  id: 'security',
});

export const EntitySecurityContent = SecurityPlugin.provide(
  createComponentExtension({
    name: 'EntitySecurityContent',
    component: {
      lazy: () => import('./components/SecurityComponent').then(m => m.SecurityComponent),
    },
  }),
);

import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

export const SecurityFrontendPlugin = createPlugin({
  id: 'security-frontend',
});

export const EntitySecurityFrontendContent = SecurityFrontendPlugin.provide(
  createComponentExtension({
    name: 'EntitySecurityFrontendContent',
    component: {
      lazy: () => import('./components/SecurityFrontendComponent').then(m => m.SecurityFrontendComponent),
    },
  }),
);

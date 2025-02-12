import 'core-js/actual';
// eslint-disable-next-line no-restricted-imports
import '../../../apps/main-site/src/styles/globals.css';
// eslint-disable-next-line no-restricted-imports
import '../../../apps/main-site/src/styles/code.scss';
import type { Decorator, Preview } from '@storybook/react';
import {
	WithAuth,
	WithTailwindTheme,
	WithHighlightJS,
} from '../src/utils/decorators';

export const parameters: Preview = {
	// @ts-ignore
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
};

export const globalTypes = {
	tailwindTheme: {
		name: 'Theme',
		description: 'Light/Dark mode for components',
		toolbar: {
			icon: 'mirror',
			dynamicTitle: true,
			items: ['light', 'dark', 'both'],
		},
		defaultValue: process.env.THEME ?? 'both',
	},
	authState: {
		name: 'Auth State',
		description: 'Toggle between signed in and not signed in',
		defaultValue: 'signedIn',
		toolbar: {
			icon: 'user',
			dynamicTitle: true,
			items: ['signedIn', 'signedOut'],
		},
	},
};

export const decorators: Decorator[] = [
	WithTailwindTheme,
	WithAuth,
	WithHighlightJS,
];

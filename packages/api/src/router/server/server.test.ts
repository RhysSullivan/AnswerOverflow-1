import { mockServer, mockServerWithFlags } from '@answeroverflow/db-mock';
import { addFlagsToServer, createServer, Server } from '@answeroverflow/db';
import { pickPublicServerData } from '~api/test/public-data';
import {
	mockAccountWithServersCallerCtx,
	testAllSourceAndPermissionVariantsThatThrowErrors,
} from '~api/test/utils';
import { serverRouter } from './server';

describe('Server Operations', () => {
	describe('Server Fetch', () => {
		let server: Server;
		beforeEach(async () => {
			server = mockServer({
				kickedTime: new Date(),
			});
			await createServer(server);
		});
		describe('By Id Public', () => {
			it('should only get public server data', async () => {
				const account = await mockAccountWithServersCallerCtx(
					server,
					'discord-bot',
					'ManageGuild',
				);
				const router = serverRouter.createCaller(account.ctx);
				const fetchedServer = await router.byIdPublic(server.id);
				expect(fetchedServer).toEqual(pickPublicServerData(server));
			});
			it("should fail if the server doesn't exist", async () => {
				const account = await mockAccountWithServersCallerCtx(
					server,
					'discord-bot',
					'ManageGuild',
				);
				const router = serverRouter.createCaller(account.ctx);
				await expect(router.byIdPublic('non-existent-server')).rejects.toThrow(
					'Server not found',
				);
			});
		});
		describe('By Id', () => {
			it('should succeed with permission variants', async () => {
				await testAllSourceAndPermissionVariantsThatThrowErrors({
					async operation({ source, permission }) {
						const account = await mockAccountWithServersCallerCtx(
							server,
							source,
							permission,
						);
						const router = serverRouter.createCaller(account.ctx);
						const fetchedServer = await router.byId(server.id);
						expect(fetchedServer).toEqual(addFlagsToServer(server));
					},
					sourcesThatShouldWork: ['discord-bot', 'web-client'],
					permissionsThatShouldWork: ['ManageGuild', 'Administrator'],
				});
			});
			it("should fail if the server doesn't exist", async () => {
				const account = await mockAccountWithServersCallerCtx(
					server,
					'discord-bot',
					'ManageGuild',
				);
				const router = serverRouter.createCaller(account.ctx);
				await expect(router.byId('non-existent-server')).rejects.toThrow(
					'Server not found',
				);
			});
		});
	});
	describe('Set Read The Rules Consent Enabled', () => {
		it('should succeed setting read the rules consent enabled with permission variants', async () => {
			await testAllSourceAndPermissionVariantsThatThrowErrors({
				async operation({ source, permission }) {
					const server = mockServer();
					await createServer(server);
					const account = await mockAccountWithServersCallerCtx(
						server,
						source,
						permission,
					);
					const router = serverRouter.createCaller(account.ctx);
					await router.setReadTheRulesConsentEnabled({
						server,
						enabled: true,
					});
				},
				sourcesThatShouldWork: ['discord-bot'],
				permissionsThatShouldWork: ['ManageGuild', 'Administrator'],
			});
		});
		it('should succeed all variants for setting read the rules consent disabled', async () => {
			await testAllSourceAndPermissionVariantsThatThrowErrors({
				async operation({ source, permission }) {
					const server = mockServerWithFlags({
						flags: {
							readTheRulesConsentEnabled: true,
						},
					});
					await createServer({
						...server,
					});
					const account = await mockAccountWithServersCallerCtx(
						server,
						source,
						permission,
					);
					const router = serverRouter.createCaller(account.ctx);
					await router.setReadTheRulesConsentEnabled({
						server,
						enabled: false,
					});
				},
				sourcesThatShouldWork: ['discord-bot'],
				permissionsThatShouldWork: ['ManageGuild', 'Administrator'],
			});
		});
		it('should fail if read the rules consent is already enabled', async () => {
			const server = mockServerWithFlags({
				flags: {
					readTheRulesConsentEnabled: true,
				},
			});
			await createServer(server);
			const account = await mockAccountWithServersCallerCtx(
				server,
				'discord-bot',
				'ManageGuild',
			);
			const router = serverRouter.createCaller(account.ctx);
			await expect(
				router.setReadTheRulesConsentEnabled({
					server,
					enabled: true,
				}),
			).rejects.toThrowError('Read the rules consent already enabled');
		});
		it('should fail if read the rules consent is already disabled', async () => {
			const server = mockServerWithFlags({
				flags: {
					readTheRulesConsentEnabled: false,
				},
			});
			await createServer(server);
			const account = await mockAccountWithServersCallerCtx(
				server,
				'discord-bot',
				'ManageGuild',
			);
			const router = serverRouter.createCaller(account.ctx);
			await expect(
				router.setReadTheRulesConsentEnabled({
					server,
					enabled: false,
				}),
			).rejects.toThrowError('Read the rules consent already disabled');
		});
	});
});

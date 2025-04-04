import React from 'react';
import { Button, Tooltip } from '@chakra-ui/react';

import './styles.scss';

import { CogSVG } from '~libs/react-core';
import { openTab } from '~libs/client-core';

import { FULL_OPTIONS_ROUTES } from '~/highlight-extension-fe/shared/ui';
import { LinkToLogin } from '~/highlight-extension-fe/widgets/link-to-login';
import { useUsers } from '~/highlight-extension-fe/entities/user';
import { useExtension, useSidePanel } from '~/highlight-extension-fe/entities/browser';
import { useCrossBrowserState } from '~/highlight-extension-fe/shared/model';

export function ExtensionControlPage(): JSX.Element {
	const [jwt] = useCrossBrowserState('jwt');

	const { openSidePanel } = useSidePanel().actions;
	const { logout } = useUsers().actions;
	const {
		data: { isExtActive },
		actions: { toggleExtension },
	} = useExtension();

	return (
		<div className="extensionControlPage">
			<header className="extensionControlPage_header">
				<Tooltip
					label="Settings"
					fontSize="md"
					placement="auto-end"
				>
					<div>
						<CogSVG
							onClick={() => openTab(FULL_OPTIONS_ROUTES.userInfo)}
							height={28}
							width={28}
							cursor="pointer"
						/>
					</div>
				</Tooltip>
			</header>
			<main>
				<Button
					onClick={openSidePanel}
					colorScheme="red"
				>
					Open sidebar
				</Button>
				<Button
					onClick={toggleExtension}
					colorScheme="teal"
				>
					{isExtActive ? 'Disable' : 'Enable'} extension
				</Button>
				{!jwt && <LinkToLogin />}
				{jwt && (
					<Button
						onClick={logout}
						colorScheme="teal"
					>
						Log out
					</Button>
				)}
			</main>
		</div>
	);
}

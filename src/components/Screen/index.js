import { h } from 'preact';
import { useEffect } from 'preact/hooks';

import i18next from 'i18next';
import ChatIcon from '../../icons/chat.svg';
import CloseIcon from '../../icons/close.svg';
import { Button } from '../Button';
import { Footer, FooterContent, PoweredBy } from '../Footer';
import { PopoverContainer } from '../Popover';
import { Sound } from '../Sound';
import { createClassName } from '../helpers';
import ScreenHeader from './Header';
import styles from './styles.scss';

export const ScreenContent = ({ children, nopadding, triggered = false }) => (
	<main className={createClassName(styles, 'screen__main', { nopadding, triggered })}>
		{children}
	</main>
);


export const ScreenFooter = ({ children, options, limit }) => (
	<Footer>
		{children && (
			<FooterContent>
				{children}
			</FooterContent>
		)}
		<FooterContent>
			{options}
			{limit}
			<PoweredBy />
		</FooterContent>
	</Footer>
);

const ChatButton = ({
	text,
	minimized,
	badge,
	onClick,
	triggered = false,
	agent,
	label,
}) => (
	<Button
		icon={minimized || triggered ? <ChatIcon /> : <CloseIcon />}
		badge={badge}
		onClick={onClick}
		className={createClassName(styles, 'screen__chat-button')}
		img={triggered && agent && agent.avatar.src}
		label={label}
	>
		{text}
	</Button>
);

const CssVar = ({ theme }) => {
	useEffect(() => {
		if (window.CSS && CSS.supports('color', 'var(--color)')) {
			return;
		}
		let mounted = true;
		(async () => {
			const { default: cssVars } = await import('css-vars-ponyfill');
			if (!mounted) {
				return;
			}
			cssVars({
				variables: {
					'--color': theme.color,
					'--font-color': theme.fontColor,
					'--icon-color': theme.iconColor,
				},
			});
		})();
		return () => {
			mounted = false;
		};
	}, [theme]);

	return <style>{`
		.${ styles.screen } {
			${ theme.color ? `--color: ${ theme.color };` : '' }
			${ theme.fontColor ? `--font-color: ${ theme.fontColor };` : '' }
			${ theme.iconColor ? `--icon-color: ${ theme.iconColor };` : '' }
		}
	`}</style>;
};

export class Screen extends Component {
	handleScreenRef = (ref) => {
		this.screenRef = ref;
	}

	handleButtonRef = (ref) => {
		this.buttonRef = ref;
	}

	getFocusableElements = () => this.screenRef.querySelectorAll(
		'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, div[contenteditable="true"]',
	);

	addFocusFirstElement = () => {
		const focusableElements = this.getFocusableElements();
		if (focusableElements.length > 0) {
			focusableElements[0].focus();
		}
	}

	handleTabKey = (e) => {
		const focusableElements = this.getFocusableElements();

		if (focusableElements.length > 0) {
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (focusableElements.length === 1) {
				firstElement.focus();
				return e.preventDefault();
			}

			if (!e.shiftKey && document.activeElement === lastElement) {
				firstElement.focus();
				return e.preventDefault();
			}

			if (e.shiftKey && document.activeElement === firstElement) {
				lastElement.focus();
				return e.preventDefault();
			}
		}
	};

	handleKeyDown = (e) => {
		const { key } = e;
		const { minimized, windowed } = this.props;

		switch (key) {
			case 'Tab':
				if (!minimized) {
					this.handleTabKey(e);
				}
				break;
			case 'Escape':
				if (!minimized && !windowed) {
					this.handleOnMinimize();
				}
				break;
			default:
				break;
		}

		e.stopPropagation();
	}

	handleOnRestore = () => {
		this.props.onRestore();
		this.addFocusFirstElement();
	}

	handleOnMinimize = () => {
		this.props.onMinimize();
		this.buttonRef.base.focus();
	}

	componentDidUpdate() {
		if (!this.props.minimized && !this.props.windowed) {
			this.addFocusFirstElement();
		}
	}

	render = ({
		theme = {},
		agent,
		title,
		notificationsEnabled,
		minimized = false,
		expanded = false,
		windowed = false,
		children,
		className,
		alerts,
		modal,
		unread,
		sound,
		onDismissAlert,
		onEnableNotifications,
		onDisableNotifications,
		onMinimize,
		onRestore,
		onOpenWindow,
		onSoundStop,
		queueInfo,
		dismissNotification,
		triggered = false,
	}) => (
		<div className={createClassName(styles, 'screen', { minimized, expanded, windowed, triggered })} ref={this.handleScreenRef} onKeyDown={this.handleKeyDown}>
			<CssVar theme={theme} />
			{triggered && <Button onClick={onMinimize} className={createClassName(styles, 'screen__chat-close-button')} icon={<CloseIcon />} label={i18next.t('close_chat')}>Close</Button>}
			<div className={createClassName(styles, 'screen__inner', { fitTextSize: triggered }, [className])}  role='dialog' aria-modal='true' aria-labelledby='header__title-id'>
				<PopoverContainer>
					{!triggered && <ScreenHeader
						alerts={alerts}
						agent={agent}
						title={title}
						notificationsEnabled={notificationsEnabled}
						minimized={minimized}
						expanded={expanded}
						windowed={windowed}
						onDismissAlert={onDismissAlert}
						onEnableNotifications={onEnableNotifications}
						onDisableNotifications={onDisableNotifications}
						onMinimize={this.handleOnMinimize}
						onRestore={onRestore}
						onOpenWindow={onOpenWindow}
						queueInfo={queueInfo}
					/>}

					{modal}
					{children}
				</PopoverContainer>
			</div>

			<ChatButton
				agent={agent}
				triggered={triggered}
				text={title}
				badge={unread}
				minimized={minimized}
				onClick={minimized ? this.handleOnRestore : this.handleOnMinimize}
				label={minimized ? i18next.t('open_chat') : i18next.t('close_chat')}
				ref={this.handleButtonRef}
			/>

			{sound && <Sound src={sound.src} play={sound.play} onStop={onSoundStop} dismissNotification={dismissNotification} />}
		</div>
	)
}


Screen.Content = ScreenContent;
Screen.Footer = ScreenFooter;


export default Screen;

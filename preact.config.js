const webpackOverride = require('./webpackOverride.config');

export default (config, env, helpers) => {
	// Use Preact CLI's helpers object to get the babel-loader
	const babel = helpers.getLoadersByName(config, 'babel-loader')[0].rule;
	// Update the loader config to include preact-i18nline
	babel.loader = [
		{ // create an entry for the old loader
			loader: babel.loader,
			options: babel.options,
		},
		{ // add the preact-i18nline webpack loader
			loader: 'preact-i18nline/webpack-loader',
		},
	];
	// remove the old loader options
	delete babel.options;
	config = webpackOverride(config);
	return config;
};

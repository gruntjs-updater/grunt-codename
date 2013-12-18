/*
 * grunt-codename
 * https://github.com/scriptwerx/grunt-codename
 *
 * Copyright (c) 2013 scriptwerx
 * Licensed under the MIT license.
 * @version 0.0.3 "Perseus Amber" (Pangolin)
 */

/* jslint todo: true, white: true */
/* global module, require */

module.exports = function (grunt) {

	"use strict";

	var codeNames,
		patchNames;

	/**
	 *
	 * @param p_version
	 * @returns {string}
	 */

	function getCodeName (p_version)
	{
		var codeName = "";

		for (var i in codeNames)
		{
			if (codeNames.hasOwnProperty (i) && p_version.substr (0, 3) === i) codeName = codeNames[i];
		}

		return codeName;
	}

	/**
	 *
	 * @param p_version
	 * @returns {string}
	 */

	function getPatchName (p_version)
	{
		var patchName = "";

		for (var i in patchNames)
		{
			if (patchNames.hasOwnProperty (i) && p_version.substr (4, 1) === i) patchName = patchNames[i];
		}

		return patchName;
	}

	/**
	 * Register
	 */

	grunt.registerMultiTask ("codename", 'Deliver application codename based on version.', function () {

		var path = require ("path"),
			data = grunt.file.readJSON (path.join (__dirname, "/codeNameData.json")),
			options = this.options ({
				patch: false,
				data: undefined,
				patchNames: undefined,
				codeNames: undefined
			});

		if (options.data !== undefined)
		{
			if (options.data.hasOwnProperty ("codeNames")) codeNames = options.data.codeNames;
			if (options.data.hasOwnProperty ("patchNames")) patchNames = options.data.patchNames;
		}
		else
		{
			codeNames = (options.codeNames !== undefined) ? options.codeNames : data.codeNames;
			patchNames = (options.patchNames !== undefined) ? options.patchNames : data.patchNames;
		}

		this.filesSrc.forEach (function (filepath) {

			grunt.verbose.writeln ("Injecting codename into: " + filepath);

			try {
				var f = grunt.file.readJSON (filepath),
					writeFile = false,
					oldName = f.codename,
					newName = getCodeName (f.version),
					oldPatchName = f.patchName,
					patchName = options.patch ? getPatchName (f.version) : "",
					patchUpdated = false;

				if (oldName !== newName) {
					f.codename = newName;
					writeFile = true;
				}

				if (oldPatchName !== patchName) {
					f.patchName = patchName;
					writeFile = patchUpdated = true;
				}

				if (writeFile) {
					grunt.file.write (filepath, JSON.stringify (f, null, 4));
					grunt.log.writeln ("Codename in \"" + filepath + "\" changed from \"" + oldName +"\" to \"" + newName + "\"");
					if (patchUpdated) grunt.log.writeln ("Codename (patchName) in \"" + filepath + "\" changed from \"" + oldPatchName + "\" to \"" + patchName + "\"");
				}
				else
				{
					grunt.log.writeln ("Codename in \"" + filepath + "\" correct as \"" + f.codename + "\"");
					if (options.patch) grunt.log.writeln ("Codename (patchName) in \"" + filepath + "\" correct as \"" + f.patchName + "\"");
				}
			}
			catch (e) {
				grunt.verbose.error ();
				grunt.verbose.error (e);
				grunt.fail.warn ("Codename operation failed.");
			}
		});
	});
};

/* lib/expobject/data/index.js */
const EXPRESSIF_HTTP_CODES = require('../httpcodes');
const EXPRESSIF_HTTP_TYPES = require('../types');
const optionsCollector = require('../optionscollector');

class ExpData {

	/**
	 * Constructor
	 * @param {string}  type Valid Response type(e.g Ok, NotContent). Could accept any string but there are several values defined in type.js
	 * @param {integer} httpstatus Http Statuc Code(e.g 200, 201, 203). Could accept any value but there are several values defined in httpcodes.js
	 * @param {object}  data Custom data object.
	 * @param {object}  options Object with additionals properties for the error description. Object could have any custom additional property Also allow fixed props like [`errorObject`, `adheaders`]
	 */
	constructor(type = null, httpstatus = null, data={}, options={}){
		this._type = type || EXPRESSIF_HTTP_TYPES.oK;
		this._httpstatus =  httpstatus || EXPRESSIF_HTTP_CODES.oK;
		this._data = data || {};
		const { adheaders, props } = optionsCollector(options);
		this._adheaders = adheaders || {}; // Any additional header to attach in error response
		this._props = props;
	}

	get httpstatus() {
		return this._httpstatus;
	}

	get type(){
		return this._type;
	}

	get data() {
		return this._data;
	}

	get props() {
		return this._props;
	}

	get adheaders() {
		return this._adheaders;
	}

	get hasAdditionalHeaders() {
		return Object.keys(this._adheaders).length > 0;
	}
}


module.exports = ExpData;

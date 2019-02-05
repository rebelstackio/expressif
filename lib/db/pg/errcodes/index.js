/* lib/db/pg/errcodes/index.js */
'use strict';

const mapping = {
	"57750": 577.5,    /* "unhandled_db_error" */
	"50011": 500.11,   /* "upsert_not_implemented" */
	"23000": 400.501,  /* "integrity_constraint_violation" */
	"23001": 400.502,  /* "restrict_violation" */
	"23502": 400.503,  /* "not_null_violation" */
	"22004": 400.504,  /* "null_value_not_allowed" */
	"23503": 400.505,  /* "foreign_key_violation" */
	"23505": 400.506,  /* "unique_violation" */
	"23514": 400.507,  /* "check_violation" */
	"22003": 400.508,  /* numeric_value_out_of_range" */
	"22026": 400.509,  /* "string_data_length_mismatch" */
	"40410": 404.10,   /* "resource_not_found" */
	"40411": 404.11,   /* "identity_not_found" */
	"40910": 409.10,   /* "empty_update" */
	"40111": 401.11,   /* "incorrect_user_or_password" */
};

module.exports = function getError(code) {
	return (mapping[code] || mapping['57750']).toString()
}

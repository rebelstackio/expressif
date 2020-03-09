/* test/lib/utils/index.js */
'use strict';

const Util = require('../../../lib/util');

describe('lib/util/index.js', () => {

	describe('#removeNulls',  () => {

		let removeNull;

		beforeEach(() => {
			removeNull = Util.removeNulls;
		});

		it('Should return the same object with the same properties and values', () => {
			const test = { test: 1 };
			expect(removeNull(test)).toMatchObject(test);
		});

		it('Should delete keys that have null values( or undefined, NaN)', () => {
			const test = { test1: 1 , test2: null, test3: undefined, test4: '', test5: NaN, test6: 0, test7: false};
			expect(removeNull(test)).toMatchObject({test1: 1, test4: '', test5: NaN, test6: 0, test7: false});
		});

		it('Should also delete nested keys if the object has object as values', () => {
			let test = { test1: 1 , test2: {  test3: undefined, test4: '', test5: NaN, test6: 0, test7: false} };
			expect(removeNull(test)).toMatchObject({test1: 1, test2: { test4: '', test5: NaN, test6: 0, test7: false}});
			test = { test1: 1 , test2: {  test3: undefined, test4: { test_a: false, test_b: 0, test_c: undefined }, test5: NaN, test6: 0, test7: false} };
			expect(removeNull(test)).toMatchObject({test1: 1, test2: { test4: { test_a: false, test_b: 0 }, test5: NaN, test6: 0, test7: false}});
		});

		it('Should remove null or undefined values if the object is an array', () => {
			let test = [1, 2, 3, null, null, undefined, 0 ,false, { t: 1 }];
			expect(removeNull(test)).toMatchObject([1, 2, 3, 0 ,false, { t: 1 }]);
		});

		it('Should also remove empty properties from an array item ', () => {
			let test = [1, 2, 3, null, null, undefined, 0 ,false, { t: 1, f: undefined, a: null }];
			expect(removeNull(test)).toMatchObject([1, 2, 3, 0 ,false, { t: 1 }]);
		});

		it('Should clean the most nested object possible', () => {
			let test = [1, 2, 3, null, null, undefined, 0 ,false, { t: 1, f: undefined, a: null, c : [ 1, 2, 3, undefined, 5, null, { a: 1, b: 2, c: undefined, d :[null, null, undefined], a1 : {}}] }];
			expect(removeNull(test)).toMatchObject(
				[1, 2, 3, 0 ,false, { t: 1, c : [ 1, 2, 3, 5, { a: 1, b: 2,  d :[], a1 : {}}] }]
			);
		});

	});

});

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

	describe('collectFilePathsRecursive', () => {

		let collectFilePathsRecursive,readdirSync, join, statSync;

		beforeEach(() => {
			collectFilePathsRecursive = Util.collectFilePathsRecursive;
			readdirSync = jest.fn().mockImplementation(() => {
				return [];
			});
			join = jest.fn();
			statSync = jest.fn(() => {
				return {
					isDirectory: () => false
				};
			});
		});

		test('collectFilePathsRecursive return an empty array if the main folder is empty', () => {
			const result = collectFilePathsRecursive('/home/nodeserver/schemas', [], { readdirSync, join, statSync });
			expect(result).toBeArrayOfSize(0);
		});

		test('collectFilePathsRecursive return an array of all the absolute paths of the files', () => {
			readdirSync = jest.fn().mockImplementation(() => {
				return [
					'file1.js',
					'file2.js',
					'file3.js'
				];
			});
			join = require('path').join;

			const result = collectFilePathsRecursive('/home/nodeserver/schemas', [], { readdirSync, join, statSync });

			expect(result).toBeArrayOfSize(3);
			expect(result[0]).toBe('/home/nodeserver/schemas/file1.js');
			expect(result[1]).toBe('/home/nodeserver/schemas/file2.js');
			expect(result[2]).toBe('/home/nodeserver/schemas/file3.js');
		});

		test('collectFilePathsRecursive must call it self recursive for nested folders', () => {
			readdirSync = jest.fn().mockImplementation(( folder ) => {
				if ( folder === '/home/nodeserver/schemas/folder1') {
					return [
						's1.json',
						's2.json',
						's3.json'
					];
				} else {
					return [
						'folder1',
					];
				}
			});
			join = require('path').join;
			statSync = jest.fn((x) => {
				if ( x === '/home/nodeserver/schemas/folder1') {
					return {
						isDirectory: () => true
					};
				} else {
					return {
						isDirectory: () => false
					};
				}
			});

			const result = collectFilePathsRecursive('/home/nodeserver/schemas', [], { readdirSync, join, statSync });

			expect(result).toBeArrayOfSize(3);
			expect(result[0]).toBe('/home/nodeserver/schemas/folder1/s1.json');
			expect(result[1]).toBe('/home/nodeserver/schemas/folder1/s2.json');
			expect(result[2]).toBe('/home/nodeserver/schemas/folder1/s3.json');
		});


		test('collectFilePathsRecursive must call it self recursive for nested folders and collect single files in the upper level', () => {
			readdirSync = jest.fn().mockImplementation(( folder ) => {
				if ( folder === '/home/nodeserver/schemas/folder1') {
					return [
						's1.json',
						's2.json',
						's3.json'
					];
				} else {
					return [
						'folder1',
						'test1.json',
						'test2.json'
					];
				}
			});
			join = require('path').join;
			statSync = jest.fn((x) => {
				if ( x === '/home/nodeserver/schemas/folder1') {
					return {
						isDirectory: () => true
					};
				} else {
					return {
						isDirectory: () => false
					};
				}
			});

			const result = collectFilePathsRecursive('/home/nodeserver/schemas', [], { readdirSync, join, statSync });

			expect(result).toBeArrayOfSize(5);
			expect(result).toIncludeAnyMembers([
				'/home/nodeserver/schemas/folder1/s1.json',
				'/home/nodeserver/schemas/folder1/s2.json',
				'/home/nodeserver/schemas/folder1/s3.json',
				'/home/nodeserver/schemas/test1.json',
				'/home/nodeserver/schemas/test2.json'
			]);
		});

	});

});



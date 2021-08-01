import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

const pathToHtml = path.join(__dirname, '../../dist/index.html')
const pathToJs = path.join(__dirname, '../../dist/browser/listener-utils.js')

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

// https://github.com/jsdom/jsdom/issues/1914#issuecomment-313786743
export async function setup(context) {
	// Path to demo
	const pathToDist = path.join(__dirname, '../../dist/index.html')
	// Create DOM
	const dom = await JSDOM.fromFile(pathToDist, {
		resources: 'usable',
		runScripts: 'dangerously',
	})

	/* Set text context */
	context.dom = dom
	const { window } = dom

	global.window = window
	global.document = window.document
	global.navigator = window.navigator
	global.getComputedStyle = window.getComputedStyle
	global.requestAnimationFrame = null;

	// Wait for dom loaded event and resolve
	return new Promise((resolve) => {
		/* load script dynamically
		const jsContents = fs.readFileSync(pathToJs, 'utf-8')
		let scriptElement = window.document.createElement('script');
		scriptElement.textContent = jsContents;
		window.document.head.appendChild(scriptElement);
 		*/
		dom.window.document.addEventListener('DOMContentLoaded', () => {
			console.log('wait for load')
			setImmediate(resolve)
		})
	})
}

export async function setupx(context) {
	// const dom = await JSDOM.fromFile(pathToHtml, {
	// 	resources: 'usable',
	// 	runScripts: 'dangerously',
	// })

	const htmlContents = fs.readFileSync(pathToHtml, 'utf-8')
	const jsContents = fs.readFileSync(pathToJs, 'utf-8')

	const dom = new JSDOM(htmlContents, {
    runScripts: "dangerously",
    resources: "usable"
	})
	const { window } = dom
	const document = window.document

	// let scriptElement = window.document.createElement('script');
	// scriptElement.textContent = jsContents;
	// document.head.appendChild(scriptElement);
	// console.log(dom.window.document.body.textContent.trim());
	// dom.window['xxx'] = 'hi'
	global.window = window
	global.document = window.document
	global.navigator = window.navigator
	global.getComputedStyle = window.getComputedStyle
	global.requestAnimationFrame = null;
	context.dom = dom
}

export function reset(context) {
	const { window } = context.dom
	window.document.title = ''
	window.document.head.innerHTML = ''
	window.document.body.innerHTML = ''
	console.log('reset')
}

/**
 * @return {RenderOutput}
 */
export function getSelector(selector) {
	return document.querySelector(selector)
}

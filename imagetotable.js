// rgbToHex and toHex was taken and adapted from http://www.javascripter.net/faq/rgbtohex.htm
// supports_canvas was taken from http://diveintohtml5.org/detect.html#canvas
(function (w, undefined) {
	"use strict";
	var d = w.document, fReader, dz, supports_canvas = function () {
		return !!d.createElement('canvas').getContext;
	}, supports_canvas_data = function () {
		if (!supports_canvas()) {
			return false;
		}
		var ctx = d.createElement('canvas').getContext('2d');
		return typeof ctx.getImageData === 'function';
	}, supports_drag_and_drop = function() {
		return 'draggable' in document.createElement('span');
	}, toHex = function (n) { 
		n = parseInt(n, 10); 
		if (isNaN(n)) { 
			return "00";
		}
		n = Math.max(0, Math.min(n, 255)); 
		return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
	}, rgbToHex = function (R, G, B) {
		return (toHex(R) + toHex(G) + toHex(B)).toLowerCase();
	}, createTd = function (c) {
		var td = d.createElement('td'); 
		td.bgColor = '#' + rgbToHex(c.r, c.g, c.b);
		if (c.a < 1) {
			td.setAttribute('style', "opacity:" + c.a + "; alpha(opacity=" + Math.ceil(c.a * 100) + ")");
		}
		return td;
	}, createTable = function (raw) {
		var pix = raw.data, h = raw.height, w = raw.width, pColor, cColor, colspan, table, tr, td, i, r, c, f, f1;
		//we use documentFragment to speed up the table creation http://ejohn.org/blog/dom-documentfragments/
		f = d.createDocumentFragment();
		//a hack to be sure that the width of the img is respected
		tr = d.createElement('tr');
		tr.setAttribute('height', 0);
		td = d.createElement('td');
		td.width = 1;
		for (c = 0; c < w; c += 1) {
			tr.appendChild(td.cloneNode(true));
		}
		f.appendChild(tr);
		//for each row
		for (r = 0; r < h; r += 1) {
			for (c = 0, colspan = 0, td = cColor = pColor = null, f1 = d.createDocumentFragment(); c < w; c += 1) {
				i = (r * w + c) * 4;
				cColor = {r : pix[i], g : pix[i + 1], b : pix[i + 2], a : Math.round(pix[i + 3] / 255 * 100) / 100};
				if (td === null) {
					td = createTd(cColor);
					colspan = 1;
				} else {
					if (cColor.r === pColor.r && cColor.g === pColor.g && cColor.b === pColor.b && cColor.a === pColor.a) {
						colspan += 1;
					} else {
						if (td !== null) {
							if (colspan > 1) {
								td.colSpan = colspan;
							}
							f1.appendChild(td);
						}
						td = createTd(cColor);
						colspan = 1;
					}
				}
				pColor = cColor;
			}
			if (td !== null) {
				if (colspan > 1) {
					td.colSpan = colspan;
				}
				f1.appendChild(td);
			}
			tr = d.createElement('tr');
			tr.setAttribute('height', 1);
			tr.appendChild(f1.cloneNode(true));
			f.appendChild(tr);
		}
		//we finally create the table
		table = d.createElement('table');
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.width = w;
		table.height = h;
		table.style.borderCollapse = 'collapse';
		table.style.border = 'none';
		table.style.backgroundColor = 'transparent';
		table.style.fontSize = '0';
		table.style.lineHeight = '0';
		table.style.width = w + 'px';
		table.style.height = h + 'px';
		table.style.tableLayout = 'fixed';
		table.appendChild(f.cloneNode(true));
		return table;
	}, img2table = function (event) {
		var img = event.target, tParent = d.querySelector('#response div'), tChild, canvas = d.createElement('canvas'), w = canvas.width = img.width, h = canvas.height = img.height, ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0, w, h);
		tChild = createTable(ctx.getImageData(0, 0, w, h));
		tParent.innerHTML = '';
		tParent.appendChild(tChild);
		tParent.style.width = w+'px';
		d.querySelector('#response textarea').value = tParent.innerHTML.replace(/<\/td>/g, '');
		d.getElementById('response').style.display = 'block';
	}, imgDragOver = function(event) {
		event.stopPropagation();
		event.preventDefault();
		d.getElementById('dropzone').className = 'dragover';
	}, getSrcImg = function (event) {
		var raw;
		if (event.dataTransfer) {
			event.stopPropagation();
			event.preventDefault();
			raw = event.dataTransfer.files[0];	
			d.getElementById('dropzone').className = '';
		} else if (event.target) {
			raw = event.target.files[0];
		} else {
			w.alert('No file found');
			return;
		}
		if (!raw || !/^image\//i.test(raw.type)) {
			w.alert('The file can not be convert into an HTML table ... sorry!!');
			return;
		}
		fReader.readAsDataURL(raw);	
	}, createImg = function (event) {
		var img = d.createElement('img');
		img.addEventListener('load', img2table, false);
		img.src = event.target.result;
	}, is_browser_capable = function () {
		var is_supported = true, s;
		s = d.getElementById('support_canvas');
		if (!supports_canvas()) {
			s.className = 'fail';
			s.innerHTML += ' <strong>Your Browser does not support the Canvas API<\/strong>';
			is_supported = false;
		} else {
			s.className = 'success';
			s.innerHTML += ' <strong>My browser just does that<\/strong>';
		}

		s = d.getElementById('support_data_image');
		if (!supports_canvas_data()) {
			s.className = 'fail';
			s.innerHTML += ' <strong>Your Browser does not support the Canvas Image Data Method<\/strong>';
			is_supported = false;
		} else {
			s.className = 'success';
			s.innerHTML += ' <strong>My browser just does that<\/strong>';
		}

		s = d.getElementById('support_file');
		if (w.File && w.FileReader && w.FileList) {
			s.className = 'success';
			s.innerHTML += ' <strong>My browser just does that<\/strong>';
		} else {
			s.className = 'fail';
			s.innerHTML += '<strong>Your Browser does not support the File API<\/strong>';
			is_supported = false;
		}
		return is_supported;
	}, init = function () {
		var is_supported = is_browser_capable();
		if (!is_supported) {
			d.getElementById('experience').style.display = 'none';
		} else {
			d.getElementById('response').style.display = 'none';
			fReader = new w.FileReader();	
			if (typeof FileReader.prototype.addEventListener === 'function') {
				fReader.addEventListener('loadend', createImg, false);
			} else {
				fReader.onloadend = createImg;
			}
			d.getElementById('src').addEventListener('change', getSrcImg, false);
			dz = d.getElementById('dropzone');
			if (!supports_drag_and_drop()) {
				dz.parentNode.style.display = 'none';	
			} else {
				dz.addEventListener('dragover', imgDragOver, false);
				dz.addEventListener('drop', getSrcImg, false);
			}
		}
	};
	init();
})(window);
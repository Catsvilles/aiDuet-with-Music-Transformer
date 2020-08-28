/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const THREE = require('three')

const geometry = new THREE.PlaneGeometry( 1, 1, 1 )
const material = new THREE.MeshBasicMaterial( {color: 0x1FB7EC, side: THREE.DoubleSide} )
const aiMaterial = new THREE.MeshBasicMaterial( {color: 0xFFB729, side: THREE.DoubleSide} )

window.zero = new THREE.Vector3(0, 0, 0)

function scale(value, inMin, inMax, min, max){
	return ((value - inMin) / (inMax - inMin)) * (max - min) + min
}

// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com
//
// Added 4D noise
// Joshua Koo zz85nus@gmail.com

/**
 * You can pass in a random number generator object if you like.
 * It is assumed to have a random() method.
 */
var SimplexNoise = function(r) {
	if (r == undefined) r = Math;
	this.grad3 = [[ 1,1,0 ],[ -1,1,0 ],[ 1,-1,0 ],[ -1,-1,0 ],
                                 [ 1,0,1 ],[ -1,0,1 ],[ 1,0,-1 ],[ -1,0,-1 ],
                                 [ 0,1,1 ],[ 0,-1,1 ],[ 0,1,-1 ],[ 0,-1,-1 ]];

	this.grad4 = [[ 0,1,1,1 ], [ 0,1,1,-1 ], [ 0,1,-1,1 ], [ 0,1,-1,-1 ],
	     [ 0,-1,1,1 ], [ 0,-1,1,-1 ], [ 0,-1,-1,1 ], [ 0,-1,-1,-1 ],
	     [ 1,0,1,1 ], [ 1,0,1,-1 ], [ 1,0,-1,1 ], [ 1,0,-1,-1 ],
	     [ -1,0,1,1 ], [ -1,0,1,-1 ], [ -1,0,-1,1 ], [ -1,0,-1,-1 ],
	     [ 1,1,0,1 ], [ 1,1,0,-1 ], [ 1,-1,0,1 ], [ 1,-1,0,-1 ],
	     [ -1,1,0,1 ], [ -1,1,0,-1 ], [ -1,-1,0,1 ], [ -1,-1,0,-1 ],
	     [ 1,1,1,0 ], [ 1,1,-1,0 ], [ 1,-1,1,0 ], [ 1,-1,-1,0 ],
	     [ -1,1,1,0 ], [ -1,1,-1,0 ], [ -1,-1,1,0 ], [ -1,-1,-1,0 ]];

	this.p = [];
	for (var i = 0; i < 256; i ++) {
		this.p[i] = Math.floor(r.random() * 256);
	}
  // To remove the need for index wrapping, double the permutation table length
	this.perm = [];
	for (var i = 0; i < 512; i ++) {
		this.perm[i] = this.p[i & 255];
	}

  // A lookup table to traverse the simplex around a given point in 4D.
  // Details can be found where this table is used, in the 4D noise method.
	this.simplex = [
    [ 0,1,2,3 ],[ 0,1,3,2 ],[ 0,0,0,0 ],[ 0,2,3,1 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 1,2,3,0 ],
    [ 0,2,1,3 ],[ 0,0,0,0 ],[ 0,3,1,2 ],[ 0,3,2,1 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 1,3,2,0 ],
    [ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],
    [ 1,2,0,3 ],[ 0,0,0,0 ],[ 1,3,0,2 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 2,3,0,1 ],[ 2,3,1,0 ],
    [ 1,0,2,3 ],[ 1,0,3,2 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 2,0,3,1 ],[ 0,0,0,0 ],[ 2,1,3,0 ],
    [ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],
    [ 2,0,1,3 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 3,0,1,2 ],[ 3,0,2,1 ],[ 0,0,0,0 ],[ 3,1,2,0 ],
    [ 2,1,0,3 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 0,0,0,0 ],[ 3,1,0,2 ],[ 0,0,0,0 ],[ 3,2,0,1 ],[ 3,2,1,0 ]];
};

SimplexNoise.prototype.dot = function(g, x, y) {
	return g[0] * x + g[1] * y;
};

SimplexNoise.prototype.dot3 = function(g, x, y, z) {
	return g[0] * x + g[1] * y + g[2] * z;
};

SimplexNoise.prototype.dot4 = function(g, x, y, z, w) {
	return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
};

SimplexNoise.prototype.noise = function(xin, yin) {
	var n0, n1, n2; // Noise contributions from the three corners
  // Skew the input space to determine which simplex cell we're in
	var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
	var s = (xin + yin) * F2; // Hairy factor for 2D
	var i = Math.floor(xin + s);
	var j = Math.floor(yin + s);
	var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
	var t = (i + j) * G2;
	var X0 = i - t; // Unskew the cell origin back to (x,y) space
	var Y0 = j - t;
	var x0 = xin - X0; // The x,y distances from the cell origin
	var y0 = yin - Y0;
  // For the 2D case, the simplex shape is an equilateral triangle.
  // Determine which simplex we are in.
	var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	if (x0 > y0) {i1 = 1; j1 = 0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1)
	else {i1 = 0; j1 = 1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
  // c = (3-sqrt(3))/6
	var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
	var y1 = y0 - j1 + G2;
	var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
	var y2 = y0 - 1.0 + 2.0 * G2;
  // Work out the hashed gradient indices of the three simplex corners
	var ii = i & 255;
	var jj = j & 255;
	var gi0 = this.perm[ii + this.perm[jj]] % 12;
	var gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
	var gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
  // Calculate the contribution from the three corners
	var t0 = 0.5 - x0 * x0 - y0 * y0;
	if (t0 < 0) n0 = 0.0;
	else {
		t0 *= t0;
		n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient
	}
	var t1 = 0.5 - x1 * x1 - y1 * y1;
	if (t1 < 0) n1 = 0.0;
	else {
		t1 *= t1;
		n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
	}
	var t2 = 0.5 - x2 * x2 - y2 * y2;
	if (t2 < 0) n2 = 0.0;
	else {
		t2 *= t2;
		n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
	}
  // Add contributions from each corner to get the final noise value.
  // The result is scaled to return values in the interval [-1,1].
	return 70.0 * (n0 + n1 + n2);
};

// 3D simplex noise
SimplexNoise.prototype.noise3d = function(xin, yin, zin) {
	var n0, n1, n2, n3; // Noise contributions from the four corners
  // Skew the input space to determine which simplex cell we're in
	var F3 = 1.0 / 3.0;
	var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
	var i = Math.floor(xin + s);
	var j = Math.floor(yin + s);
	var k = Math.floor(zin + s);
	var G3 = 1.0 / 6.0; // Very nice and simple unskew factor, too
	var t = (i + j + k) * G3;
	var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
	var Y0 = j - t;
	var Z0 = k - t;
	var x0 = xin - X0; // The x,y,z distances from the cell origin
	var y0 = yin - Y0;
	var z0 = zin - Z0;
  // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
  // Determine which simplex we are in.
	var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
	var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
	if (x0 >= y0) {
		if (y0 >= z0)
      { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; } // X Y Z order
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; } // X Z Y order
		else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; } // Z X Y order
	}
	else { // x0<y0
		if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; } // Z Y X order
    else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; } // Y Z X order
		else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; } // Y X Z order
	}
  // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
  // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
  // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
  // c = 1/6.
	var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
	var y1 = y0 - j1 + G3;
	var z1 = z0 - k1 + G3;
	var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
	var y2 = y0 - j2 + 2.0 * G3;
	var z2 = z0 - k2 + 2.0 * G3;
	var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
	var y3 = y0 - 1.0 + 3.0 * G3;
	var z3 = z0 - 1.0 + 3.0 * G3;
  // Work out the hashed gradient indices of the four simplex corners
	var ii = i & 255;
	var jj = j & 255;
	var kk = k & 255;
	var gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
	var gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
	var gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
	var gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
  // Calculate the contribution from the four corners
	var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
	if (t0 < 0) n0 = 0.0;
	else {
		t0 *= t0;
		n0 = t0 * t0 * this.dot3(this.grad3[gi0], x0, y0, z0);
	}
	var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
	if (t1 < 0) n1 = 0.0;
	else {
		t1 *= t1;
		n1 = t1 * t1 * this.dot3(this.grad3[gi1], x1, y1, z1);
	}
	var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
	if (t2 < 0) n2 = 0.0;
	else {
		t2 *= t2;
		n2 = t2 * t2 * this.dot3(this.grad3[gi2], x2, y2, z2);
	}
	var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
	if (t3 < 0) n3 = 0.0;
	else {
		t3 *= t3;
		n3 = t3 * t3 * this.dot3(this.grad3[gi3], x3, y3, z3);
	}
  // Add contributions from each corner to get the final noise value.
  // The result is scaled to stay just inside [-1,1]
	return 32.0 * (n0 + n1 + n2 + n3);
};

// 4D simplex noise
SimplexNoise.prototype.noise4d = function( x, y, z, w ) {
	// For faster and easier lookups
	var grad4 = this.grad4;
	var simplex = this.simplex;
	var perm = this.perm;

   // The skewing and unskewing factors are hairy again for the 4D case
	var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
	var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;
	var n0, n1, n2, n3, n4; // Noise contributions from the five corners
   // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
	var s = (x + y + z + w) * F4; // Factor for 4D skewing
	var i = Math.floor(x + s);
	var j = Math.floor(y + s);
	var k = Math.floor(z + s);
	var l = Math.floor(w + s);
	var t = (i + j + k + l) * G4; // Factor for 4D unskewing
	var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
	var Y0 = j - t;
	var Z0 = k - t;
	var W0 = l - t;
	var x0 = x - X0;  // The x,y,z,w distances from the cell origin
	var y0 = y - Y0;
	var z0 = z - Z0;
	var w0 = w - W0;

   // For the 4D case, the simplex is a 4D shape I won't even try to describe.
   // To find out which of the 24 possible simplices we're in, we need to
   // determine the magnitude ordering of x0, y0, z0 and w0.
   // The method below is a good way of finding the ordering of x,y,z,w and
   // then find the correct traversal order for the simplex we’re in.
   // First, six pair-wise comparisons are performed between each possible pair
   // of the four coordinates, and the results are used to add up binary bits
   // for an integer index.
	var c1 = (x0 > y0) ? 32 : 0;
	var c2 = (x0 > z0) ? 16 : 0;
	var c3 = (y0 > z0) ? 8 : 0;
	var c4 = (x0 > w0) ? 4 : 0;
	var c5 = (y0 > w0) ? 2 : 0;
	var c6 = (z0 > w0) ? 1 : 0;
	var c = c1 + c2 + c3 + c4 + c5 + c6;
	var i1, j1, k1, l1; // The integer offsets for the second simplex corner
	var i2, j2, k2, l2; // The integer offsets for the third simplex corner
	var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
   // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
   // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
   // impossible. Only the 24 indices which have non-zero entries make any sense.
   // We use a thresholding to set the coordinates in turn from the largest magnitude.
   // The number 3 in the "simplex" array is at the position of the largest coordinate.
	i1 = simplex[c][0] >= 3 ? 1 : 0;
	j1 = simplex[c][1] >= 3 ? 1 : 0;
	k1 = simplex[c][2] >= 3 ? 1 : 0;
	l1 = simplex[c][3] >= 3 ? 1 : 0;
   // The number 2 in the "simplex" array is at the second largest coordinate.
	i2 = simplex[c][0] >= 2 ? 1 : 0;
	j2 = simplex[c][1] >= 2 ? 1 : 0;    k2 = simplex[c][2] >= 2 ? 1 : 0;
	l2 = simplex[c][3] >= 2 ? 1 : 0;
   // The number 1 in the "simplex" array is at the second smallest coordinate.
	i3 = simplex[c][0] >= 1 ? 1 : 0;
	j3 = simplex[c][1] >= 1 ? 1 : 0;
	k3 = simplex[c][2] >= 1 ? 1 : 0;
	l3 = simplex[c][3] >= 1 ? 1 : 0;
   // The fifth corner has all coordinate offsets = 1, so no need to look that up.
	var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
	var y1 = y0 - j1 + G4;
	var z1 = z0 - k1 + G4;
	var w1 = w0 - l1 + G4;
	var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
	var y2 = y0 - j2 + 2.0 * G4;
	var z2 = z0 - k2 + 2.0 * G4;
	var w2 = w0 - l2 + 2.0 * G4;
	var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
	var y3 = y0 - j3 + 3.0 * G4;
	var z3 = z0 - k3 + 3.0 * G4;
	var w3 = w0 - l3 + 3.0 * G4;
	var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
	var y4 = y0 - 1.0 + 4.0 * G4;
	var z4 = z0 - 1.0 + 4.0 * G4;
	var w4 = w0 - 1.0 + 4.0 * G4;
   // Work out the hashed gradient indices of the five simplex corners
	var ii = i & 255;
	var jj = j & 255;
	var kk = k & 255;
	var ll = l & 255;
	var gi0 = perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32;
	var gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32;
	var gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32;
	var gi3 = perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32;
	var gi4 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32;
   // Calculate the contribution from the five corners
	var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
	if (t0 < 0) n0 = 0.0;
	else {
		t0 *= t0;
		n0 = t0 * t0 * this.dot4(grad4[gi0], x0, y0, z0, w0);
	}
	var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
	if (t1 < 0) n1 = 0.0;
	else {
		t1 *= t1;
		n1 = t1 * t1 * this.dot4(grad4[gi1], x1, y1, z1, w1);
	}
	var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
	if (t2 < 0) n2 = 0.0;
	else {
		t2 *= t2;
		n2 = t2 * t2 * this.dot4(grad4[gi2], x2, y2, z2, w2);
	}   var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
	if (t3 < 0) n3 = 0.0;
	else {
		t3 *= t3;
		n3 = t3 * t3 * this.dot4(grad4[gi3], x3, y3, z3, w3);
	}
	var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
	if (t4 < 0) n4 = 0.0;
	else {
		t4 *= t4;
		n4 = t4 * t4 * this.dot4(grad4[gi4], x4, y4, z4, w4);
	}
   // Sum up and scale the result to cover the range [-1,1]
	return 27.0 * (n0 + n1 + n2 + n3 + n4);
};


class RollClass {
	constructor(container){
		this._element = document.createElement('div')
		this._element.id = 'roll'

		this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000)
		this._camera.position.z = 1
		this._camera.lookAt(new THREE.Vector3(0, 0, 0))

		this._scene = new THREE.Scene()

		this._renderer = new THREE.WebGLRenderer({alpha: true})
		this._renderer.setClearColor(0x000000, 0)
		this._renderer.setPixelRatio( window.devicePixelRatio )
		this._renderer.sortObjects = false
		this._element.appendChild(this._renderer.domElement)

		this._currentNotes = {}

		let icosahedronGeometry = new THREE.IcosahedronGeometry(200, 4);
		let lambertMaterial = new THREE.MeshLambertMaterial({
			color: 0x008080,
			wireframe: true
    	});


		this.ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    	this.ball.position.set(this._camera.position.x + 400, this._camera.position.y + 300, 1);
    	this._scene.add(this.ball);

    	let ambientLight = new THREE.AmbientLight(0xaaaaaa);
    	this._scene.add(ambientLight);

    	let spotLight = new THREE.SpotLight(0xffffff);
    	spotLight.intensity = 0.9;
    	spotLight.position.set(-10, 40, 20);
    	spotLight.lookAt(this.ball);
    	spotLight.castShadow = true;
    	this._scene.add(spotLight);


		window.camera = this._camera;

		//start the loop
		this._lastUpdate = Date.now()
		//this._boundLoop = this._loop.bind(this) render_ball
        this._boundLoop = this.render_ball.bind(this)
		this._boundLoop()
		window.addEventListener('resize', this._resize.bind(this))
        this.ready = false;

	}

	set_stream(stream){
	    console.log(stream)
        this.context = new AudioContext();
		let src = this.context.createMediaStreamSource(stream);
        this.analyser = this.context.createAnalyser();
        src.connect(this.analyser);
        this.analyser.fftSize = 512;
        let bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.ready = true
    }

	get bottom(){
		return this._element.clientHeight + this._camera.position.y
	}

	appendTo(container){
		container.appendChild(this._element)
		this._resize()
	}

	add(element){
		console.log("Nothing")
		//this._scene.add(element)
	}


	// https://medium.com/@mag_ops/music-visualiser-with-three-js-web-audio-api-b30175e7b5ba
	makeRoughBall(mesh, bassFr, treFr) {
	        let noise = new SimplexNoise()
  			mesh.geometry.vertices.forEach((vertex, i) => {
  			let amp = 10;
			let offset = mesh.geometry.parameters.radius;
    		let time = window.performance.now();
    		vertex.normalize();
    		let noise_3d = noise.noise3d(
                vertex.x + time * 0.00007,
                vertex.y + time * 0.00008,
                vertex.z + time * 0.00009
   			 )

    		let distance = (offset + bassFr) + noise_3d * amp * treFr;
            vertex.multiplyScalar(distance);
  });
  		mesh.geometry.verticesNeedUpdate = true;
  		mesh.geometry.normalsNeedUpdate = true;
  		mesh.geometry.computeVertexNormals();
  		mesh.geometry.computeFaceNormals();
}

	keyDown(midi, box, ai=false){
		const selector = ai ? `ai${midi}` : midi
		if (!this._currentNotes.hasOwnProperty(selector)){
			this._currentNotes[selector] = []
		}
		if (midi && box){
			//translate the box coords to this space
			const initialScaling = 10000
			const plane = new THREE.Mesh( geometry, ai ? aiMaterial : material )
			const margin = 4
			const width = box.width - margin * 2
			plane.scale.set(width, initialScaling, 1)
			plane.position.z = 0
			plane.position.x = box.left  + margin + width / 2
			plane.position.y = this._element.clientHeight + this._camera.position.y + initialScaling / 2
			this._scene.add(plane)

			this._currentNotes[selector].push({
				plane : plane,
				position: this._camera.position.y
			})
		}

	}

	keyUp(midi, ai=false){
		const selector = ai ? `ai${midi}` : midi
		if (this._currentNotes[selector] && this._currentNotes[selector].length){
			const note = this._currentNotes[selector].shift()
			const plane = note.plane
			const position = note.position
			// get the distance covered
			plane.scale.y = Math.max(this._camera.position.y - position, 5)
			plane.position.y = this._element.clientHeight + position + plane.scale.y / 2
		}
	}

	_resize(){
		const frustumSize = 1000
		const aspect = this._element.clientWidth / this._element.clientHeight
		//make it match the screen pixesl
		this._camera.left 	=	0
		this._camera.bottom	=	this._element.clientHeight
		this._camera.right  =   this._element.clientWidth
		this._camera.top    =   0

		//update things
		this._camera.updateProjectionMatrix()
		this._renderer.setSize( this._element.clientWidth, this._element.clientHeight )
	}

	_loop(){
		const delta = Date.now() - this._lastUpdate
		this._lastUpdate = Date.now()
		requestAnimationFrame(this._boundLoop)
		this._renderer.render( this._scene, this._camera)
		//this._camera.position.y += 1 / 10 * delta
	}

	avg(arr){
    let total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
    }

     max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
    }

    fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
    }

    modulate(val, minVal, maxVal, outMin, outMax) {
    let fr = this.fractionate(val, minVal, maxVal);
    let delta = outMax - outMin;
    return outMin + (fr * delta);
}

	render_ball() {
	    if (this.ready) {
            this.analyser.getByteFrequencyData(this.dataArray);
            let lowerHalfArray = this.dataArray.slice(0, (this.dataArray.length / 2) - 1);
            let upperHalfArray = this.dataArray.slice((this.dataArray.length / 2) - 1, this.dataArray.length - 1);

            let lowerMax = this.max(lowerHalfArray);
            let upperAvg = this.avg(upperHalfArray);

            let lowerMaxFr = lowerMax / lowerHalfArray.length;
            let upperAvgFr = upperAvg / upperHalfArray.length;

            this.makeRoughBall(this.ball, this.modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 30), this.modulate(upperAvgFr, 0, 1, 0, 20));

        }
      this._renderer.render(this._scene, camera);
      requestAnimationFrame(this._boundLoop);
    }
}

//const Roll = new RollClass()
export {RollClass}
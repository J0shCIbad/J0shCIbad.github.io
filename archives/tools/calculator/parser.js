/**
 *	Author: Josh Ibad
 *	
 *	Simple binary tree for the calculator token tree
 */
var outputFlags = 1;
var outSpecFlags = 1;
var inputFlags = 1;

const outDec = 1;
const outBin = 2;
const outHex = 4;
const outCustom = 8;
const outButtonIDs = ["outDecButton", "outBinButton", "outHexButton", "outCustomButton"];

const outNorm = 1;
const outIEEE754_32 = 2;
const outIEEE754_64 = 4;
const outSpecButtonIDs = ["outNormButton", "outIEEE754_32Button", "outIEEE754_64Button"];

const inNormal = 1;
const inIEEE754_32 = 2;
const inIEEE754_64 = 4;
const inButtonIDs = ["inNormButton", "inIEEE754_32", "inIEEE754_64"];


/**
 *	Simple Node class
 */
class Node{
	constructor(key){
		this.key = key;
		this.parent = null;
		this.left = null;
		this.right = null;
	}
}


/**
 *	Calculator Token Tree implemented as a binary tree.
 */
class CalculatorTokenTree{
	/**
	 *	Default constructor
	 */
	constructor(){
		this.root = null;
		this.currNode = null;
		this.subScope = null;
		this.isFloat = false;
		this.latex = false;
	}
	
	/** Evaluate the entire tree */
	evaluate(){
		let ans = this.evaluateHelp(this.root);
		return ans;
	}
	
	/**
	 *	Evaluate the tree specified by the inputted node
	 *	#param node - Root node of the subtree to be evaluted
	 */
	evaluateHelp(node){
		if(node.left == null && node.right == null){
			return node.key;
		}else{
			switch(node.key){
				case "+":
					return this.evaluateHelp(node.left) + this.evaluateHelp(node.right);
				case "-":
					return this.evaluateHelp(node.left) - this.evaluateHelp(node.right);
				case "*":
					return this.evaluateHelp(node.left) * this.evaluateHelp(node.right);
				case "/":
					return this.evaluateHelp(node.left) / this.evaluateHelp(node.right);
				case "%":
					return this.evaluateHelp(node.left) % this.evaluateHelp(node.right);
				case "^":
					return Math.pow( this.evaluateHelp(node.left), this.evaluateHelp(node.right) );
				default:
					return node.key;
			}
		}
	}
	
	
	toLaTeX(){
		if(this.root != null){
			return this.toLaTeXHelper(this.root);
		}
	}
	toLaTeXHelper(node){
		if(node.left == null && node.right == null){
			return ""+node.key;
		}else{
			let tmp_left = this.toLaTeXHelper(node.left);
			let tmp_right = this.toLaTeXHelper(node.right);
			switch(node.key){
				case "/":
					if( (typeof(tmp_left) == "string" && tmp_left.endsWith(")")) ||
							(typeof(tmp_right) == "string" && tmp_right.startsWith("("))){
						return "\\frac{" + tmp_left + "}{" + tmp_right + "}";
					}else{
						return tmp_left + "\\div " + tmp_right;
					}
				
				case "%":
					return "(" + tmp_left + "\\mod " + tmp_right + ")";
				case "*": 
					return tmp_left + "\\cdot " + tmp_right;
				case "+": case "-": case "^":
					return tmp_left + node.key + tmp_right;
				default:
					return "" + node.key;
			}
		}
	}
	
	
	/** Print all nodes */
	printAll(){ this.print(this.root); }
	/** Print all nodes */
	print(node){
		if(node != null){
			this.print(node.left);
			console.log(node.key);
			this.print(node.right);
		}
	}
	
	
	/**
	 * Return the priority of the operation
	 */
	priority(op){
		switch(op){
			case "+": case "-": return 3;
			case "*": case "/": case "%": return 2;
			case "^": return 1;
			default: return 0;
		}
	}
	
	
	/**
	 *	Evaluates an immediate numerical token
	 *	#param key - Numerical token being evaluated
	 *	#ret - The numerical value of the token passed
	 */
	evalNum(key){
		console.log(key);
		if(this.latex){return key;}
		if( typeof(key) == "number") {return key;}
		if(key.includes(".")){ //Is float
			this.isFloat = true;
			if(key.endsWith('h') || key.startsWith("0x")){
				return parseInt(key, 16); //Change
			}else if(key.endsWith('b')){
				return parseInt(key, 2); //Change
			}else if(key.endsWith('o')){
				return parseInt(key, 8);
			}else{
				return parseFloat(key);
			}
		}else{ 
			if(key.endsWith('h')){
				if( (inputFlags == inIEEE754_32) && (key.length==9) ){
					/* Interpret as IEEE754 32-bit */
					return this.evalIEEE754_32(key.substring(0,8));
				}else if( (inputFlags == inIEEE754_64) && (key.length==17) ){
					/* Interpret as IEEE754 64-bit */
					return this.evalIEEE754_64(key.substring(0,16));
				}else{
					return parseInt(key, 16);
				}
			}else if(key.startsWith("0x")){
				if( (inputFlags == inIEEE754_32) && (key.length==10) ){
					/* Interpret as IEEE754 32-bit */
					return this.evalIEEE754_32(key.substring(2));
				}else if( (inputFlags == inIEEE754_64) && (key.length==18) ){
					/* Interpret as IEEE754 64-bit */
					return this.evalIEEE754_64(key.substring(2));
				}else{
					return parseInt(key, 16);
				}
			}else if(key.endsWith('b')){
				if( (inputFlags == inIEEE754_32) && (key.length==33) ){
					/* Interpret as IEEE754 32-bit */
					return this.evalIEEE754_32bin(key.substring(0,32));
				}else if( (inputFlags == inIEEE754_64) && (key.length==65) ){
					/* Interpret as IEEE754 64-bit */
					return this.evalIEEE754_32bin(key.substring(0,64));
				}else{
					return parseInt(key, 2);
				}
			}else if(key.endsWith('o')){
				return parseInt(key, 8);
			}else{
				return parseInt(key);
			}
		}
	}
	
	evalIEEE754_32(key){
		let tmp_arr = [];
		let tmp_ind = 0;
		for(tmp_ind = 0; tmp_ind<key.length; tmp_ind++){
			switch(key.charAt(tmp_ind)){
				case "a": case "A": tmp_arr.push(10); break;
				case "b": case "B": tmp_arr.push(11); break;
				case "c": case "C": tmp_arr.push(12); break;
				case "d": case "D": tmp_arr.push(13); break;
				case "e": case "E": tmp_arr.push(14); break;
				case "f": case "F": tmp_arr.push(15); break;
				default: tmp_arr.push( key.charCodeAt(tmp_ind) - 48 );
			}
		}
		
		let tmp_exp = (tmp_arr[0] & 7) * 32 + tmp_arr[1]*2;
		if(tmp_arr[2] & 8){ tmp_exp += 1; }
		tmp_exp -= 127; /*Subtract bias to get unbiased exponent*/
		let tmp_significand = (tmp_arr[2] & 7) * 1048576.0 + tmp_arr[3] * 65536.0 + tmp_arr[4] * 4096 +
			tmp_arr[5] * 256 + tmp_arr[6] * 16 + tmp_arr[7];
		
		let tmp_result = 1.0 + (tmp_significand / 8388608.0);
		tmp_result *= Math.pow(2, tmp_exp);
		if(tmp_arr[0] & 8){ //Check sign
			tmp_result *= -1;
		}
		return tmp_result;
	}
	evalIEEE754_32bin(key){
		return this.evalIEEE754_32( parseInt(key, 2).toString(16) );
	}
	
	
	evalIEEE754_64(key){
		let tmp_arr = [];
		let tmp_ind = 0;
		for(tmp_ind = 0; tmp_ind<key.length; tmp_ind++){
			switch(key.charAt(tmp_ind)){
				case "a": case "A": tmp_arr.push(10); break;
				case "b": case "B": tmp_arr.push(11); break;
				case "c": case "C": tmp_arr.push(12); break;
				case "d": case "D": tmp_arr.push(13); break;
				case "e": case "E": tmp_arr.push(14); break;
				case "f": case "F": tmp_arr.push(15); break;
				default: tmp_arr.push( key.charCodeAt(tmp_ind) - 48 );
			}
		}
		
		let tmp_exp = (tmp_arr[0] & 7) * 256 + tmp_arr[1]*16 + tmp_arr[2];
		tmp_exp -= 1023; /*Subtract bias to get unbiased exponent*/
		let tmp_significand = 0.0;
		
		for(tmp_ind = 15; tmp_ind >= 3; tmp_ind--){
			tmp_significand += tmp_arr[tmp_ind] * Math.pow(16, 15-tmp_ind);
		}
		console.log(tmp_significand);
		let tmp_result = 1.0 + (tmp_significand / 4503599627370496.0);
		tmp_result *= Math.pow(2, tmp_exp);
		if(tmp_arr[0] & 8){ //Check sign
			tmp_result *= -1;
		}
		return tmp_result;
	}
	evalIEEE754_64bin(key){
		return this.evalIEEE754_64( parseInt(key, 2).toString(16) );
	}
	
	/**
	 *	Inserts a token into the tree
	 *	#param key - Token to enter into the tree
	 */
	insert(key){
		if( this.subScope == null ){
			if(this.root == null){
				if( key == "(" || key == "[" || key == "{" ){
					this.subScope = new CalculatorTokenTree();
					this.subScope.latex = this.latex;
				}else{
					if( key === "-" ){
						this.insert(-1);
						this.insert("*");
					}else{
						this.root = new Node( this.evalNum(key) );
						this.currNode = this.root;
					}
				}
			}else{
				 switch(key){
					case "(": case "[": case "{":
						if( this.priority(this.currNode.key) == 0){
							this.insert("*");
						}
						this.subScope = new CalculatorTokenTree();
						this.subScope.latex = this.latex;
						break;
					case "÷": this.insert("/"); break;
					case "×": this.insert("*"); break;
					case "-":
						if(this.priority(this.currNode.key) != 0 ){
							this.insert(-1);
							this.insert("*");
							break;
						}
					case "+":
					case "*": case "/": case "%":
					case "^":
						var newNode = new Node(key);
						while( this.currNode.parent != null && this.priority(key) >= this.priority(this.currNode.parent.key) ){
							this.currNode = this.currNode.parent;
						}
						if(this.currNode.parent == null){
							newNode.left = this.currNode;
							this.root = newNode;
							this.currNode = newNode;
						}else{
							newNode.left = this.currNode;
							newNode.parent = this.currNode.parent;
							if(newNode.parent == null){
								this.root = newNode;
							}else{
								if(this.currNode.parent.left == this.currNode){
									this.currNode.parent.left = newNode;
								}else{
									this.currNode.parent.right = newNode;
								}
							}
							this.currNode.parent = newNode;
							this.currNode = newNode;
						}
						break;
						
					default:
						key = this.evalNum(key);
						var newNode = new Node(key);
						newNode.parent = this.currNode;
						if(this.currNode.left == null){
							this.currNode.left = newNode;
						}else{
							this.currNode.right = newNode;
						}
						this.currNode = newNode;
						break;
				}
			}
		}else{
			if( this.subScope.subScope == null && (key == ")" || key == "]" || key == "}") ){
				let tmp_term = "";
				if(this.latex){
					tmp_term = "(" + this.subScope.toLaTeX() + ")";
				}else{
					tmp_term = this.subScope.evaluate();
				}
				this.subScope = null;
				this.insert( tmp_term );
			}else{
				this.subScope.insert(key);
			}
		}
	}
}


/**
 *	Evaluates the string input, parsing through it and using a binary tree
 *	to keep track of tokenized input, and finally evaluating the inputted
 *	expression.
 *	#param input - String expression
 */
async function evaluate(input){
	input = input.replace(/\s/g,''); //Get rid of all whitespace
	let index = 0;
	let tree = new CalculatorTokenTree();
	let str = "";
	while(index < input.length){
		let charVal = input.charCodeAt(index);
		if( (charVal>=48 && charVal<=57) || (charVal == 46) || (charVal>=65 && charVal<=90) || (charVal>=97 && charVal<=122) ){
			str += input.charAt(index);
		}else{
			if( str !== "" ){
				await tree.insert(str);
				str = "";
			}
			await tree.insert(input.substring(index, index+1));
		}
		index++;
	}
	if( str !== "" ){
		tree.insert(str);
	}
	
	return tree.evaluate();
}

/**
 *	Evaluates the input from the input tag in the user interface and
 *	print the results in the correct sections of the winter page.
 */
async function evaluateInput(){
	try{
		let user_input = document.getElementById("user_input").value;
		let tmp_ans = "WAIT";
		await (tmp_ans = evaluate(user_input));
		
		tmp_ans.then((value) => {
			switch(outputFlags){
				case outBin:
					value = toBin(value);
					break;
				case outHex:
					value = toHex(value);
					break;
				case outCustom:
					value = toCustom(value);
					break;
			}
			document.getElementById("results").innerHTML = value;
		});
		Promise.resolve(tmp_ans);
	}catch(err){}
}


/**
 *	Toggle out the output format flag w/ the flag inputted.
 *	#param flag - Output format flag
 */
function toggleOutFlag(flag){
	let tmp_index=0;
	let tmp_specOps = document.getElementById("specialOutOps");
	for(tmp_index=0; tmp_index<4; tmp_index++){
		let tmp_button = document.getElementById(outButtonIDs[tmp_index]);
		tmp_button.style.backgroundColor = "#181a30";
	}
	
	switch(flag){
		case outDec:
			document.getElementById(outButtonIDs[0]).style.backgroundColor = "#00008b";
			tmp_specOps.style.display = "none";
			break;
		case outBin:
			document.getElementById(outButtonIDs[1]).style.backgroundColor = "#00008b";
			tmp_specOps.style.display = "flex";
			break;
		case outHex:
			document.getElementById(outButtonIDs[2]).style.backgroundColor = "#00008b";
			tmp_specOps.style.display = "flex";
			break;
		case outCustom:
			document.getElementById(outButtonIDs[3]).style.backgroundColor = "#00008b";
			tmp_specOps.style.display = "none";
			break;
	}
	outputFlags = flag;
	evaluateInput();
}


/**
 *	Toggle out the output format flag w/ the flag inputted.
 *	#param flag - Output format flag
 */
function toggleOutSpecFlag(flag){
	let tmp_index=0;
	for(tmp_index=0; tmp_index<3; tmp_index++){
		let tmp_button = document.getElementById(outSpecButtonIDs[tmp_index]);
		tmp_button.style.backgroundColor = "#181a30";
	}
	
	switch(flag){
		case outNorm:
			document.getElementById(outSpecButtonIDs[0]).style.backgroundColor = "#00008b";
			break;
		case outIEEE754_32:
			document.getElementById(outSpecButtonIDs[1]).style.backgroundColor = "#00008b";
			break;
		case outIEEE754_64:
			document.getElementById(outSpecButtonIDs[2]).style.backgroundColor = "#00008b";
			break;
	}
	outSpecFlags = flag;
	evaluateInput();
}


/**
 *	Toggle out the input format flag w/ the flag inputted.
 *	#param flag - Input format flag
 */
function toggleInFlag(flag){
	let tmp_index=0;
	for(tmp_index=0; tmp_index<3; tmp_index++){
		let tmp_button = document.getElementById(inButtonIDs[tmp_index]);
		tmp_button.style.backgroundColor = "#181a30";
	}
	
	switch(flag){
		case inNormal:
			document.getElementById(inButtonIDs[0]).style.backgroundColor = "#00008b";
			break;
		case inIEEE754_32:
			document.getElementById(inButtonIDs[1]).style.backgroundColor = "#00008b";
			break;
		case inIEEE754_64:
			document.getElementById(inButtonIDs[2]).style.backgroundColor = "#00008b";
			break;
	}
	inputFlags = flag;
	evaluateInput();
}


/**
 *	Convert the decimal input value into a binary string representation.
 *	#param value - Decimal input value
 *	#ret - Binary string representation
 */
function toBin(value){
	let tmp_sign = "0";
	if(value < 0){
		value *= -1;
		tmp_sign = "1";
	}
	let tmp_str = "";
	let tmp_exp = 0;
	switch(outSpecFlags){
		case outIEEE754_32:
			tmp_str = (value >>> 0).toString(2).substring(1);
			if(tmp_str.length > 23){
				tmp_str = tmp_str.substring(0, 23);
			}
			tmp_exp = Math.floor(Math.log2(value)) + 127;
			value = value % 1.0;
			while(tmp_str.length < 23){ //Number of significand bits
				value *= 2.0;
				if(value >= 1.0){
					tmp_str += "1";
					value -= 1.0;
				}else{
					tmp_str += "0";
				}
			}
			tmp_str = (tmp_exp >>> 0).toString(2) + tmp_str;
			while(tmp_str.length < 31){
				tmp_str = "0" + tmp_str;
			}
			return tmp_sign + tmp_str + "b";
		case outIEEE754_64:
			tmp_str = (value >>> 0).toString(2).substring(1);
			if(tmp_str.length > 52){
				tmp_str = tmp_str.substring(0, 52);
			}
			tmp_exp = Math.floor(Math.log2(value)) + 1023;
			value = value % 1.0;
			while(tmp_str.length < 52){ //Number of significand bits
				value *= 2.0;
				if(value >= 1.0){
					tmp_str += "1";
					value -= 1.0;
				}else{
					tmp_str += "0";
				}
			}
			tmp_str = (tmp_exp >>> 0).toString(2) + tmp_str;
			while(tmp_str.length < 63){
				tmp_str = "0" + tmp_str;
			}
			return tmp_sign + tmp_str + "b";
		case outNorm: default:
			return ((value >>> 0).toString(2)) + "b";
	}
}


/**
 *	Convert the decimal input value into a hexadeicmal string representation.
 *	#param value - Decimal input value
 *	#ret - Hexadecimal string representation
 */
function toHex(value){
	let tmp_str = "";
	switch(outSpecFlags){
		case outIEEE754_32:
		case outIEEE754_64:
			let tmp_val = toBin(value);
			tmp_val = tmp_val.substring(0, tmp_val.length-1);
			let tmp_ind = 0;
			for(tmp_ind = 0; tmp_ind<tmp_val.length; tmp_ind+=4){
				tmp_str += parseInt(tmp_val.substring(tmp_ind, tmp_ind+4), 2).toString(16);
			}
			return "0x"+tmp_str;
		case outNorm: default:
			return "0x"+((value >>> 0).toString(16));
	}
}


/**
 *	Convert the decimal input value into a string representation of custom base.
 *	#param value - Decimal input value
 *	#ret - String representation in the user-specified base.
 */
function toCustom(value){
	try{
		return (value >>> 0).toString( parseInt(document.getElementById("out_custom_base").value) );
	}catch(err){
		toggleOutFlag(outDec);
	}
}

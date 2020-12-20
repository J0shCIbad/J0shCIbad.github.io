/**
 *	Author: Josh Ibad
 *	
 *	Simple binary tree for the calculator token tree
 */
var outputFlags = 1;

const outDec = 1;
const outBin = 2;
const outHex = 4;
const outCustom = 8;
const outButtonIDs = ["outDecButton", "outBinButton", "outHexButton", "outCustomButton"];


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
		if(this.latex){return key;}
		if( typeof(key) == "number") {return key;}
		if(key.includes(".")){ //Is float
			this.isFloat = true;
			if(key.endsWith('h')){
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
				return parseInt(key, 16);
			}else if(key.endsWith('b')){
				return parseInt(key, 2);
			}else if(key.endsWith('o')){
				return parseInt(key, 8);
			}else{
				return parseInt(key);
			}
		}
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
case "×": this.insert("*");
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
			}/**/
			document.getElementById("results").value = value;
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
	for(tmp_index=0; tmp_index<4; tmp_index++){
		let tmp_button = document.getElementById(outButtonIDs[tmp_index]);
		tmp_button.style.backgroundColor = "#181a30";
	}
	
	switch(flag){
		case outDec:
			document.getElementById(outButtonIDs[0]).style.backgroundColor = "#00008b";
			break;
		case outBin:
			document.getElementById(outButtonIDs[1]).style.backgroundColor = "#00008b";
			break;
		case outHex:
			document.getElementById(outButtonIDs[2]).style.backgroundColor = "#00008b";
			break;
		case outCustom:
			document.getElementById(outButtonIDs[3]).style.backgroundColor = "#00008b";
			break;
	}
	outputFlags = flag;
	evaluateInput();
}


/**
 *	Convert the decimal input value into a binary string representation.
 *	#param value - Decimal input value
 *	#ret - Binary string representation
 */
function toBin(value){
	return ((value >>> 0).toString(2)) + "b";
}


/**
 *	Convert the decimal input value into a hexadeicmal string representation.
 *	#param value - Decimal input value
 *	#ret - Hexadecimal string representation
 */
function toHex(value){
	return "0x"+((value >>> 0).toString(16));
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

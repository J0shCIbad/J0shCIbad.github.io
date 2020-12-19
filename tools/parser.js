/**
 *	Author: Josh Ibad
 *	
 *	Simple binary tree for the calculator token tree
 */

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
	}
	
	/** Evaluate the entire tree */
	evaluate(){
		let ans = this.evaluateHelp(this.root); 
		console.log("Answer");
		console.log(ans);
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
		if( typeof(key) == "number") {return key;}
		if(key.includes(".")){ //Is float
			this.isFloat = true;
			if(key.endsWith('h')){
				return parseInt(key, 16); //Change
			}else if(key.endsWith('b')){
				return parseInt(key, 2); //Change
			}else{
				return parseFloat(key);
			}
		}else{ 
			if(key.endsWith('h')){
				return parseInt(key, 16);
			}else if(key.endsWith('b')){
				return parseInt(key, 2);
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
				}else{
					this.root = new Node( this.evalNum(key) );
					this.currNode = this.root;
				}
			}else{
				 switch(key){
					case "(": case "[": case "{":
						this.subScope = new CalculatorTokenTree();
						break;
					
					case "+": case "-":
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
				let tmp_term = this.subScope.evaluate();
				this.subScope = null;
				this.insert( tmp_term );
			}else{
				this.subScope.insert(key);
			}
		}
	}
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function evaluateInput(){
	try{
		let user_input = document.getElementById("user_input").value;
		let tmp_ans = "WAIT";
		await (tmp_ans = evaluate(user_input));
		
		tmp_ans.then((value) => {
			document.getElementById("results").innerHTML = value;
			console.log(value);
		});
		Promise.resolve(tmp_ans);
	}catch(err){
		document.getElementById("results").innerHTML = "Invalid input. Please refer to usage below.";
	}
}
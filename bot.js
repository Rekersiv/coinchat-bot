String.prototype.chunk = function(size) {
    return [].concat.apply([],
		this.split('').map(function(x,i){ return i%size ? [] : this.slice(i,i+size) }, this)
    )
}

var username = "";
var chatBuffer = [];
var shutdown = false;
var io = require('socket.io-client');
var serverUrl = 'http://192.155.86.153:8888/';
var conn = io.connect(serverUrl);
var roll = require('roll');
 
console.log('Connecting');

conn.on("connect", function() {
    console.log('Connected, Logging In...');
	conn.emit('accounts', {action: "login", username: "USERNAME", password: "PASSWORD"});
	console.log('Logged In');
	
	
	function chat(room, msg, color) {
		chatBuffer.push("chat", {room: room, message: msg, color: color});
	}
	
	function pm(user, msg, color) {
		chatBuffer.push({room: 'RekBot:' + user.toLowerCase(), message: msg});
	}
	
	function join(room) {
		conn.emit("joinroom", {join: room});
	}
	
	function tip(user, amount, msg) {
		conn.emit("tip", {room: 'highlo', user: user, tip: amount, message: msg});
	}
	function tip(obj) {
		chatBuffer.push({tipobj: obj});
    }
    setInterval(function() {	
		if (chatBuffer[0]) {
			if (chatBuffer[0].tipobj) {
				conn.emit("tip", chatBuffer[0].tipobj);
			}
			else {
			conn.emit("chat", chatBuffer[0]);
			}
			chatBuffer.splice(0, 1);
		}
		else {
			if (shutdown) {
			console.log('Shutting down...');
			process.exit(0);
			}
		}
    }, 800);
	
	
	chat("highlo", "RekBot Started", '000');
	console.log('Joined Room highlo');

	
	conn.on('message', function(data) {console.log('S: ' + data.message)});
		
	setTimeout(function() {
		conn.on("chat", function(data) {
			username = data.username;
			if (data.room === "highlo") {
				console.log(data.room + ' | ' + data.user + ' | ' +  data.message + ' (' + data.winbtc + ' mBTC)');
			
				if(contains(data.message, ["!bot"])){
					chat('highlo', 'Hello ' + data.user + '.', '000')
				}
				if (contains(data.message, ["!shutdown"]) && (data.user === "Rekersiv")) {
					chat("highlo", "Shutting Down...", '000');
					shutdown = true;
				}
				if (contains(data.message, ["!restart"]) && (data.user === "Rekersiv")) {
					chat("highlo", "Restarting...", '000');
					console.log('Restarting...');
					process.exit(0);
				}
				if (contains(data.message, ["!help"])) {
					chat('highlo', data.user + ': Commands: !state, !bets, !lastwinner', '000');
					chat('highlo', data.user + ': To use: /tip RekBot (amount) (bet type)', '000');
					chat('highlo', data.user + ': Example: /tip RekBot 0.1 field', '000');
					chat('highlo', data.user + ': For the different types of bets please type !types', '000');
				}
				
				
				if (contains(data.message, ["<span class='label label-success'>has tipped RekBot"]) && data.user === "Rekersiv") {
					var amount = data.message.substring(52).split(" ")[0];
					var extract = data.message.substring(data.message.indexOf('message: '));
					var type = extract.substring(9, extract.indexOf(') !'));
					var typeLow = type.toLowerCase();
					
					if (typeLow === 'field') {
                        console.log(typeLow);
                        var rolling = roll.roll('3d6');
                        var result = rolling.result; // Returns Total # Of All 3 Dice
                        var outcome = rolling.rolled; // Returns The Numbers Rolled
                        var user = data.user
                                                                                               
                        chat('highlo', data.user + ': You Have Rolled [' + outcome + ']', '000');
                        if (result === 8 || result === 12) {
                            chat('highlo', data.user + ': Sorry, not a winner. [' + result + '] does not fall outside the range of 8 through 12', '000');
                        }
                        if (result >= 13) {
                            chat('highlo', data.user + ': You Are A Winner! [' + result + '] is larger than 12', '000');
                            //tip(user, '0.2', 'High Lo Dice Winner. Congrats!')
                        }
                        if (result <= 7) {
							chat('highlo', data.user + ': You Are A Winner! [' + result + '] is less than 8', '000');
                            //tip(user, '0.2', 'High Lo Dice Winner. Congrats!')
                        }
                        if  (result >=9 && result <=11) {
                            chat('highlo', data.user + ': Sorry, not a winner. [' + result + '] does not fall outside the range of 8 through 12', '000');
                        }
                        }  else {
                        if (typeLow === 'small') {
                            console.log(typeLow);
                            var rolling = roll.roll('3d6');
                            var result = rolling.result;
                            var outcome = rolling.rolled;
                            var user = data.user
       
                            chat('highlo', data.user + ': You Have Rolled [' + outcome + ']', '000');
							if (result === 10) {
								chat('highlo', data.user + ': You Are A Winner! [' + result + ']', '000');
                            }
                            if (result <= 9) {
                                chat('highlo', data.user + ': You Are A Winner! [' + result + '] is smaller than 10', '000');
                            }
                            if (result >= 11) {
                                chat('highlo', data.user + ': Sorry, not a winner. [' + result + '] is larger than 10', '000');
                            }
                            } else {
                            if (typeLow === 'big') {
                                console.log(typeLow);
                                var rolling = roll.roll('3d6');
                                var result = rolling.result;
                                var outcome = rolling.rolled;
                                var user = data.user
                                               
                                chat('highlo', data.user + ': You Have Rolled [' + outcome + ']', '000');
                                if (result === 11) {
                                    chat('highlo', data.user + ': You Are A Winner! [' + result + ']', '000');
                                }
                                if (result >= 12) {
									chat('highlo', data.user + ': You Are A Winner! [' + result + '] is larger than 11', '000');
                                }
                                if (result <= 10) {
                                    chat('highlo', data.user + ': Sorry, not a winner. [' + result + '] is less than 11', '000');
                                }
                                } else {
                                    chat('highlo', '[' + type + '] Is Not A Valid Bet Type. Type !bets to see a list of available options', '000');
								}}}
				}
			}})
	}, 3000);
});


function contains(string, terms){
	for(var i=0; i<terms.length; i++){
		if(string.toLowerCase().indexOf(terms[i].toLowerCase()) == -1){
			return false;
		}
	}
	return true;
}


conn.on('error', function(err) {
    console.log('Failed to start');
    console.log(err);
    process.exit(1);
});

const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.argv.length == 2 ? process.env.token : "";
const welcomeChannelName = "안녕하세요";
const byeChannelName = "안녕히가세요";
const welcomeChannelComment = "어서오세요.";
const byeChannelComment = "안녕히가세요.";

client.on('ready', () => {
  console.log(`${client.user.tag}에 로그인하였습니다!`);
  client.user.setPresence({ game: { name: '!명령어' }, status: 'online' })
});

client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
  const newUser = member.user;
  const welcomeChannel = guild.channels.find(channel => channel.name == welcomeChannelName);

  welcomeChannel.send(`<@${newUser.id}> ${welcomeChannelComment}\n`);

  member.addRole(guild.roles.find(role => role.name == "일반인"));
});

client.on("guildMemberRemove", (member) => {
  const guild = member.guild;
  const deleteUser = member.user;
  const byeChannel = guild.channels.find(channel => channel.name == byeChannelName);

  byeChannel.send(`<@${deleteUser.id}> ${byeChannelComment}\n`);
});

client.on('message', (message) => {
  if(message.content === 'ping') {
    message.reply('pong');
  }
  
  else if(message.content.startsWith('!공지')) {
    if(checkPermission(message)) return
    if(message.member != null) { // 채널에서 공지 쓸 때
      let contents = message.content.slice('!공지2'.length);
      let embed = new Discord.RichEmbed()
        .setAuthor('공지 of enesisbot')
        .setColor('#186de6')
        .setFooter(`Genesisbot`)
        .setTimestamp()
  
      embed.addField('공지: ', contents);
  
      message.member.guild.members.array().forEach(x => {
        if(x.user.bot) return;
        x.user.send(embed)
      });
  
      return message.reply('공지를 전송했습니다.');
    } else {
      return message.reply('채널에서 실행해주세요.');
    }

  if(message.content === '!명령어') {
    let img = 'https://postfiles.pstatic.net/MjAyMDA1MDRfMTYx/MDAxNTg4NTE4OTQ5NTMy.r7sC0SYx8ntaKn8eRNhUHa1DqnAdEhPpYV_lo0uZgiog.oHl1sUkm7G6mUQG_4kWDBRTlHQyTaIFA2rFLn95YL1sg.PNG.vb0877/%ED%8C%80%EC%A0%9C%EB%84%A4%EC%8B%9C%EC%8A%A4_%EB%A1%9C%EA%B3%A0.png?type=w773';
    let embed = new Discord.RichEmbed()
      .setTitle('타이틀')
      .setAuthor('제네시스', img)
      .setThumbnail(img)
      .addBlankField()
      .addField('일반인', '!초대코드\n!명령어\n추가예정\n')
      .addField('관리자', '!kick\n!ban\n!청소<숫자>\n!공지<할말>\n')
      .addBlankField()
      .setTimestamp()
      .setFooter('제네시스', img)

    message.channel.send(embed)
  }
  else if(message.content == '!초대코드') {
    client.guilds.array().forEach(x => {
      x.channels.find(x => x.type == 'text').createInvite({maxAge: 0}) // maxAge: 0은 무한이라는 의미, maxAge부분을 지우면 24시간으로 설정됨
        .then(invite => {
          message.channel.send(invite.url)
        })
        .catch((err) => {
          if(err.code == 50013) {
            message.channel.send('**'+x.channels.find(x => x.type == 'text').guild.name+'** 채널 권한이 없어 초대코드 발행 실패')
          }
        })
    });
  }

  if (message.content.startsWith('!kick')) {
  
    const user = message.mentions.users.first();
    if (user) {
      const member = message.guild.member(user);
      if (member) {
        member
          .kick('감사로그에 표시될 사유를 입력해주세요 (선택) ')
          .then(() => {
            message.reply(`${user.tag}를 성공적으로 추방했습니다.`);
          })
          .catch(err => {
            message.reply('유저 추방에 실패하였습니다.');
            console.error(err);
          });
      } else {
        message.reply("해당 유저는 길드에 존재하지 않습니다!");
      }
    } else {
      message.reply("추방할 유저를 언급하지 않았습니다!");
    }
  }

  if (message.content.startsWith('!ban')) {
    
    const user = message.mentions.users.first();
    if (user) {
      const member = message.guild.member(user);
      if (member) {

        member
          .ban({
            reason: '나빠요!?',
          })
          .then(() => {
            message.reply(`${user.tag}를 성공적으로 차단했습니다.`);
          })
          .catch(err => {
            message.reply('유저 추방에 실패하였습니다.');
            console.error(err);
          });
      } else {
        message.reply("That user isn't in this guild!");
      }
    } else {
      message.reply("추방할 유저를 언급하지 않았습니다!");
    }
  }
  
  else if(message.content.startsWith('!청소')) {
    if(message.channel.type == '!청소') {
      return message.reply('dm에서 사용할 수 없는 명령어 입니다.');
    }
    
    if(message.channel.type != '!청소' && checkPermission(message)) return

    var clearLine = message.content.slice('!청소 '.length);
    var isNum = !isNaN(clearLine)

    if(isNum && (clearLine <= 0 || 100 < clearLine)) {
      message.channel.send("1부터 99까지의 숫자만 입력해주세요.")
      return;
    } else if(!isNum) { // c @나긋해 3
      if(message.content.split('<@').length == 2) {
        if(isNaN(message.content.split(' ')[2])) return;

        var user = message.content.split(' ')[1].split('<@!')[1].split('>')[0];
        var count = parseInt(message.content.split(' ')[2])+1;
        let _cnt = 0;

        message.channel.fetchMessages().then(collected => {
          collected.every(msg => {
            if(msg.author.id == user) {
              msg.delete();
              ++_cnt;
            }
            return !(_cnt == count);
          });
        });
      }
    } else {
      message.channel.bulkDelete(parseInt(clearLine)+1)
        .then(() => {
          AutoMsgDelete(message, `<@${message.author.id}> ` + parseInt(clearLine) + "개의 메시지를 삭제했습니다. (이 메세지는 잠시 후에 사라집니다.)");
        })
        .catch(console.error)
    }
  }
});

function checkPermission(message) {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) {
    message.channel.send(`<@${message.author.id}> ` + "명령어를 수행할 관리자 권한을 소지하고 있지않습니다.")
    return true;
  } else {
    return false;
  }
}

function changeCommandStringLength(str, limitLen = 8) {
  let tmp = str;
  limitLen -= tmp.length;

  for(let i=0;i<limitLen;i++) {
      tmp += ' ';
  }

  return tmp;
}

async function AutoMsgDelete(message, str, delay = 3000) {
  let msg = await message.channel.send(str);

  setTimeout(() => {
    msg.delete();
  }, delay);
}

client.login(token);
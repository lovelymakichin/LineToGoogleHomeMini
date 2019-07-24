const express = require('express');
const bodyParser = require('body-parser');
var request = require('request');

const app = express();

//line messaging API用
const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: 'MessagingAPIのchannelAccessTokenを入れる'
});
const groupId = 'BOTが入るグループIDを入れる';

// urlencodedとjsonは別々に初期化する
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//herokuなのでポート指定こんな感じらしい
app.listen(process.env.PORT, process.env.IP);
console.log('Server is online.');

//POSTきたらコレが動く多分。
app.post('/', function(req, res) {

//送受信両方載っけたかったので、よくわからないけどJSONの中身があるかないかで判別する
//こっちはメッセージを読み上げる用
  if(req.body.events){

    // リクエストボディを出力（確認用）
    console.log(req.body);
    // パラメータを出力（確認用）
    console.log(req.body.events[0].message);
    console.log(req.body.events[0].source.groupId);

    //JSONの中身を変数に入れてる。多分
    var user1 = req.body.events[0].source.userId;
    var textmain = req.body.events[0].message.text;
    var lineReplyToken = req.body.events[0].replyToken;

    //リプライトークンを出力（確認用）
    console.log(lineReplyToken);

　　　　　　　　//メッセージ受信した時のJSONに入ってるUserIdを使ってユーザー名を取る
    client.getProfile(user1)
      .then((profile) => {

　　　　　　　　//LINEの名前とかIDを出力（確認用）
        console.log(profile.displayName);
        console.log(profile.userId);

        var username = profile.displayName;
        res.end();

        //IFTTTにWebhook送信
        //POSTのなかみ
        var options = {
          uri: "IFTTTのWebhook先のURLを入れる",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            value1: username,
            value2: textmain
          })
        };
        //IFTTTにPOST
        request.post(options, function(error, response, body){

          //完了後、BOTからリプライする
          /*
          var message = {
            type: 'text',
            text: 'Google Home Done!'
          };

          client.replyMessage(lineReplyToken, message)
          .then(() => {
          })
          .catch((err) => {
            // error handling
          });
          */
        });
      })
      .catch((err) => {
        // error handling
　　　　　　　　　　　　　　　　//多分なんかしなくちゃいけない
      });
    }else{

　　　　　　　　　　　　//こっちはGoogleHomeに喋ったメッセージをLINEに投稿する方
      // リクエストボディを出力
      console.log(req.body);
      var texttoline = req.body.text;
      console.log(texttoline);
      res.write('ok');
      res.end();

      const message = {
        type: 'text',
        text: texttoline
      };

      client.pushMessage(groupId, message)
        .then(() => {
        })
        .catch((err) => {
          // error handling
　　　　　　　　　　　　　　　　　　　　//多分なんかしなくちゃいけない
        });
    }
})

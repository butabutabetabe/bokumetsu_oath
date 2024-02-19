const Form = FormApp.openById("GoogleFormsID") 
const ss = SpreadsheetApp.openById("スプレッドシートのID名");

//回答全削除
function allDeleteResponse(){
  Form.deleteAllResponses();
}

//質問全削除
function deleteItem(){
  const items = Form.getItems();
  for(let i of items){
    Form.deleteItem(i);
  }
  
}

//質問再生成
function createForm(){

  //全アイテム削除
  deleteItem()


  const questionSheet = ss.getSheetByName("質問");
  const formTitle = questionSheet.getRange('B1').getDisplayValue();
  const formDesc = questionSheet.getRange('B2').getDisplayValue();
  

  //質問リストの範囲
  const firstRow = 4
  const lastRow = questionSheet.getLastRow()
  const dataRows = lastRow - firstRow + 1

  const quetionList = questionSheet.getRange(firstRow,1,dataRows ,8).getDisplayValues()

  questionList = quetionList.map(question => {
    return {
      title: question[0],
      desc: question[1],
      type:question[2],
      article:question[3],
      randamSheetName1:question[4],
      randamSheetName2:question[5],
      feedbackFlag:question[6],
      feedbackText:question[7],
      required:question[8]
    }
  })

  Form.setTitle(formTitle);
  Form.setDescription(formDesc);
  //Form.setIsQuiz(true)
  questionList.forEach(question => {
    
    //出題形式で分岐
    switch(question.type){
        //テキストボックス　記載を縛る必要性がないので枠だけ設ける
        case 'text':
          const txtItem = Form.addTextItem();

          txtItem.setTitle(question.title);
          txtItem.setHelpText(question.desc);

        break;
        case 'check':
          const chkItem = Form.addCheckboxItem()
          const descitem = Form.addSectionHeaderItem()
          chkItem.setTitle(question.title);
          switch(question.feedbackFlag){
            case '0':
            chkItem.setChoices([chkItem.createChoice(question.article,true)]);
            descitem.setHelpText(question.feedbackText)
            //chkItem.setFeedbackForCorrect(FormApp.createFeedback().setText(question.feedbackText).build());
            break;
            case '1':
            chkItem.setChoices([chkItem.createChoice(question.article,true)]);
            descitem.setTitle('命令♥')
            descitem.setHelpText(choiceRamdam(question.randamSheetName1))
            //chkItem.setFeedbackForCorrect(FormApp.createFeedback().setText(choiceRamdam(question.randamSheetName1)).build());
            break;
            default:
            chkItem.setChoices([chkItem.createChoice(question.article)])
            break;
          }
          if(question.required == 1){
            chkItem.setRequired(true);
          };
          break;
        case 'upd':
          const updItem = Form.addCheckboxItem();
          updItem.setTitle(question.title)
          .setHelpText(question.desc)
          .setChoices([updItem.createChoice(question.article,true)]);
        break;
        case 'img':
          const imgURL = choiceRamdam(question.randamSheetName1);
          const img = UrlFetchApp.fetch(imgURL);
          const imgItem = Form.addImageItem().setImage(img);
          imgItem.setTitle(choiceRamdam(question.randamSheetName2));
          break;
        case 'break':
          const pageBreakItem = Form.addPageBreakItem();
          if(question.desc.length > 0){
            pageBreakItem.setTitle(question.desc);
          }
          
          break;

        default:
         //console.log('抜けてるよ')

    };

  });


}

//ランダム生成した配列から一つ取り出すやつ
function choiceRamdam(sheetName){
  const randamQSheet = ss.getSheetByName(sheetName)
  const rowNum = randamQSheet.getLastRow() -1 ;
  const range = randamQSheet.getRange(2,1,rowNum,1);
  const allChoices = range.getValues()
  //ランダムソートをかける
  const shuffleQuestion = this.shuffle(allChoices)

  return shuffleQuestion[0]
}


//配列をランダムソートする関数
function shuffle(inputs){
  let array = inputs;
  for(let i = array.length -1 ; i > 0 ; i--){
    const r = Math.floor(Math.random() * (i + 1));
    
    const tmp = array[i]
    array[i] = array[r]
    array[r] = tmp
  };
  return array
};


//ゴミ箱内のファイルを完全削除
function removeFiles(){
  const files = DriveApp.getTrashedFiles()

  while(files.hasNext()){
    const file = files.next();
    const id = file.getId();

    Drive.files.remove(id);
    Utilities.sleep(1000);
  }
}
//署名データをゴミ箱へ移動
function delSignFiles(){
  const folder = DriveApp.getFolderById("フォルダID");
  const files = folder.getFiles();
  while(files.hasNext()){
    let file = files.next();
    file.setTrashed(true);
  }
}
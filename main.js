const output = document.querySelector("output");
const button = document.querySelector("button");
const [input1, input2, input3] = document.querySelectorAll("input");

const numToKanji = (num) => {
    if(num === 1) return "太郎";
    if(num === 2) return "次郎";
    const ns = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const name = (""+num).split("").map(e=>ns[+e]).join("")+"郎";
    return name;
}

class Game {
    constructor(villagerNum, knightNum, werewolfNum, output){
        this.villagerNum = villagerNum;
        this.knightNum = knightNum;
        this.werewolfNum = werewolfNum;
        this.output = output;
        this.member = [...(()=>{const a=new Array(villagerNum);a.fill("v");return a;})(), ...(()=>{const a=new Array(knightNum);a.fill("k");return a;})(), ...(()=>{const a=new Array(werewolfNum);a.fill("w");return a;})()].sort(()=>Math.random()-0.5).map((e, i)=>({name: numToKanji(i+1), role: e}));
        this.result = this.member.map(e => ({name: e.name, role: {"v": "村人", "k": "騎士", "w": "人狼"}[e.role], remark: "最後まで生存した。"}));
        this.date = 0;
    }
    check(){
        const v = this.member.filter((e)=>e.role==="v").length;
        const k = this.member.filter((e)=>e.role==="k").length;
        const w = this.member.filter((e)=>e.role==="w").length;
        if(w === 0){
            const resultHeading = document.createElement("h2");
            resultHeading.textContent = "結果";
            const villagerVictoryParagraph = document.createElement("p");
            villagerVictoryParagraph.textContent = `人狼は全滅した。${this.date}日で村人陣営の勝利！`;
            this.output.append(resultHeading, villagerVictoryParagraph);
        }else if(w >= v+k){
            const resultHeading = document.createElement("h2");
            resultHeading.textContent = "結果";
            const werewolfVictoryParagraph = document.createElement("p");
            werewolfVictoryParagraph.textContent = `村は人狼に支配された。${this.date}日で人狼陣営の勝利！`;
            this.output.append(resultHeading, werewolfVictoryParagraph);
        }
        if(w===0 || w>=v+k){
            const shotaiHeading = document.createElement("h3");
            shotaiHeading.textContent("正体");
            const shotaiList = document.createElement("ul");
            for(const e of this.result){
                const shotaiListItem = document.createElement("li");
                shotaiListItem.textContent = `${e.name}: ${e.role} (${e.remark})`;
                shotaiList.append(shotaiListItem);
            }
            this.output.append(shotaiHeading, shotaiList);
            return true;
        }
        return false;
    }
    start(){
        output.textContent = "";
        while(true){
            if(this.check()) break;
            console.log(`${this.date+1}日目 開始`);
            const daytimeHeading = document.createElement("h2");
            daytimeHeading.textContent = `${this.date+1}日目 昼`;
            this.output.append(daytimeHeading)
            while(true){
                const voteHeading = document.createElement("h3");
                voteHeading.textContent = "投票";
                this.output.append(voteHeading);
                let voteResult = new Array(this.member.length);
                voteResult.fill(0);
                const voteList = document.createElement("ul");
                for(let i=0; i<this.member.length; i+=1){
                    const vote = Math.floor(Math.random()*this.member.length);
                    voteResult[vote] += 1;
                    const voteListItem = document.createElement("li");
                    voteListItem.textContent = `${this.member[i].name} => ${this.member[vote].name}`;
                    voteList.appendChild(voteListItem);
                }
                this.output.appendChild(voteList);
                let flag = true;
                let sac = 0;
                let max = 0;
                for(let i=0; i<this.member.length; i+=1){
                    if(voteResult[i] > max){
                        sac = i;
                        flag = true;
                        max = voteResult[i];
                    }else if(voteResult[i] === max){
                        flag = false;
                    }
                }
                if(flag){
                    const executionParagraph = document.createElement("p");
                    executionParagraph.textContent = `${this.member[sac].name}を処刑した。`;
                    this.output.appendChild(executionParagraph);
                    const no = this.result.findIndex(e=>e.name===this.member[sac].name);
                    this.result[no].remark = `${this.date+1}日目の昼に処刑された。`;
                    this.member = this.member.filter((_, i) => i!==sac);
                    break;
                }else{
                    const ikenwareParagraph = document.createElement("p");
                    ikenwareParagraph.textContent = "意見が割れた。";
                    this.output.append(ikenwareParagraph);
                }
            }
            if(this.check()) break;
            const nightHeading = document.createElement("h2");
            nightHeading.textContent = `${this.date+1}日目 夜`;
            this.output.append(nightHeading);
            const wolfTarget = Math.floor(Math.random()*this.member.length);
            let knightTarget = -1;
            if(this.member.some(e=>e.role==="k")) knightTarget = Math.floor(Math.random()*this.member.length);
            if(wolfTarget === knightTarget){
                const nanimookorazuParagraph = document.createElement("p");
                nanimookorazuParagraph.textContent = "何も起こらなかった。";
                this.output.append(nanimookorazuParagraph);
            }else{
                const killedParagraph = document.createElement("p");
                killedParagraph.textContent = `${this.member[wolfTarget].name}が食われた。`;
                this.output.append(killedParagraph);
                const no = this.result.findIndex(e=>e.name===this.member[wolfTarget].name);
                this.result[no].remark = `${this.date+1}日目の夜に食われた。`;
                this.member = this.member.filter((_, i) => i!==wolfTarget);
            }
            this.date += 1;
        }
    }
}

button.addEventListener("click", () => {
    const v = Math.floor(+input1.value);
    const k = Math.floor(+input2.value);
    const w = Math.floor(+input3.value);
    if(v<0 || k<0 || w<0 || Number.isNaN(v) || Number.isNaN(k) || Number.isNaN(w)){
        alert("不正な入力です。");
        return;
    }
    const game = new Game(v, k, w, output);
    game.start();
})

const LOCAL_IMAGENS = "recursos/imagens/";

const canvas = document.getElementById('cenario-jogo');
const LARGURA_CANVAS = canvas.width;
const ALTURA_CANVAS = canvas.height;

var ctx = canvas.getContext("2d");

var somExplosao = new Audio('recursos/audio/somExplosao.mp3');

//Objetos
var msgInicial;
var fundoCenario;
var relogio;
var jogador;
var meteoros = Array();
var cuboDourado;

var jogo = {
    iniciaJogo: function() {
        this.tempo = setInterval(atualizaJogo, 50);
        console.log('Iniciou');
    },
    paraJogo: function(){
        clearInterval(this.tempo);
        if (msgInicial)
        {
            msgInicial.desenhaImagem();
        }

        console.log('Parou');
    },
    limpaCenario: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function iniciaJogo()
{
    //Cria Objetos
    fundoCenario = new ObjetoFundoCenario('space2', 640, 480, 0, 0);
    fundoCenario.desenhaImagem();
    
    relogio = new Relogio();
    relogio.desenhaImagem();

    jogador = new Jogador('disco-voador', 250, 400);
    jogador.desenhaImagem();

    meteoros.push(new Meteoro('meteoro1', 64, -120, 5, 5));
    meteoros.push(new Meteoro('meteoro2', 192, -120, 5, 5));
    meteoros.push(new Meteoro('meteoro1', 320, -120, 5, 5));
    meteoros.push(new Meteoro('meteoro3', 448, -120, 5, 5));
    meteoros.push(new Meteoro('meteoro1', 576, -120, 5, 5));

    cuboDourado = new CuboDourado('cubo-dourado', LARGURA_CANVAS/2, ALTURA_CANVAS/2, 10, 10);
    cuboDourado.desenhaImagem();

    //Inicia Loop do Jogo
    jogo.iniciaJogo();
}

function atualizaJogo()
{
    jogo.limpaCenario();

    fundoCenario.movimenta();
    fundoCenario.desenhaImagem();
    
    relogio.atualiza();
    relogio.desenhaImagem();

    jogador.movimenta();
    jogador.desenhaImagem();

    for (let i = 0 ; i < meteoros.length ; i++)
    {
        meteoros[i].movimenta();
        meteoros[i].desenhaImagem();

        if (!meteoros[i].colidiu)
        {
            jogador.colide(meteoros[i].posX, meteoros[i].posY, meteoros[i].larguraObjeto, meteoros[i].alturaObjeto, 'INIMIGO');
        }

        if (jogador.bala.disparada)
        {
            meteoros[i].colide(jogador.bala.posX, jogador.bala.posY, jogador.bala.larguraObjeto, jogador.bala.alturaObjeto);
        }

        jogador.bala.colide(meteoros[i].posX, meteoros[i].posY, meteoros[i].larguraObjeto, meteoros[i].alturaObjeto);
    }

    if (!cuboDourado.colidiu)
    {
        cuboDourado.movimenta();
        jogador.colide(cuboDourado.posX, cuboDourado.posY, cuboDourado.larguraObjeto, cuboDourado.alturaObjeto, 'CUBO');
        cuboDourado.colide(jogador.posX, jogador.posY, jogador.larguraObjeto, jogador.alturaObjeto);
    }
    
    cuboDourado.desenhaImagem();

    if (jogador.energia == 0)
    {
        jogador.desenhaImagem();
        jogo.paraJogo();
    }
}

class Jogador {
    constructor(nomeImagem, posXInicial, posYInicial){
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + nomeImagem + '.png';
        this.largura = this.imagem.width;
        this.altura = this.imagem.height;
        this.numQuadrosImagem = 3;
        this.tempoAnimacao = 5;
        this.tempo = 0;
        this.imgAnimacao = 0;

        this.posX = posXInicial;
        this.posY = posYInicial;
        this.velocidadeX = 5;
        this.velocidadeY = 0;
        this.direcaoX = 0;
        this.direcaoY = 0;

        this.larguraObjeto = 100;
        this.alturaObjeto = 70;

        this.colidiu = false;
        this.energia = 3;
        this.tempoColete = 60;

        this.bala = new Bala(this.posX, this.posY);
    }

    move(sentido){        
        if (((sentido == -1) && (this.posX < 0)) || ((sentido == 1) && (this.posX + this.larguraObjeto > LARGURA_CANVAS)))
        {
            this.para();
        }
        else
        {
            this.direcaoX = sentido;
        }
    }

    para(){
        this.direcaoX = 0;
    }

    dispara(){
        if (!this.bala.disparada)
        {
            this.bala.dispara(this.posX + 42, this.posY);
            //somTiro.play();
        }
    }

    colide(x, y, lar, alt, tipo){
        if (!this.colidiu)
        {
            if (!((this.posX > x + lar) || (this.posX + this.larguraObjeto < x) || (this.posY > y + alt) || (this.posY + this.alturaObjeto < y)))
            {
                if (tipo == 'INIMIGO')
                {
                    if (this.energia > 0)
                    {
                        this.energia = this.energia - 1;
                    }
                    
                    this.colidiu = true;
                }
                else if (tipo == 'CUBO')
                {
                    if (this.energia < 3)
                    {
                        this.energia = this.energia + 1;
                    }
                }
            }
        }
        else
        {
            if (this.tempoColete > 0)
            {
                this.tempoColete = this.tempoColete - 1;
            }
            else
            {
                this.colidiu = false;
                this.tempoColete = 60;
            }
        }
    }

    movimenta(){
        this.posX = this.posX + (this.velocidadeX * this.direcaoX);
        this.posY = this.posY + (this.velocidadeY * this.direcaoY);

        if (this.bala.disparada)
        {
            this.bala.movimenta();
        }
    }

    desenhaImagem(){
        let posAnimacao = this.imgAnimacao * (this.largura / 3);

        ctx.drawImage(this.imagem, posAnimacao, 0, this.largura / 3, this.altura, this.posX, this.posY, 100, 70);

        this.tempo = this.tempo + 1;

        if (this.tempo == this.tempoAnimacao)
        {
            this.imgAnimacao = (this.imgAnimacao + 1) % this.numQuadrosImagem;
            this.tempo = 0;
        }

        if (this.bala.disparada)
        {
            this.bala.desenhaImagem();
        }

        //ENERGIA (MAX 90, MIN 0, 3X30)
        ctx.fillStyle = 'yellow';
        ctx.fillRect(10, 10, 96, 30);
        ctx.fillStyle = 'red';
        ctx.fillRect(13, 13, this.energia * 30, 24);
    }
}

class Bala {
    constructor(posXInicial, posYInicial){
        this.disparada = false;

        this.posX = posXInicial;
        this.posY = posYInicial;
        this.velocidadeX = 0;
        this.velocidadeY = 50;
        this.direcaoX = 0;
        this.direcaoY = -1;

        this.larguraObjeto = 15; //Para 02 tiros paralelos
        this.alturaObjeto = 30;

        this.colidiu = false;
    }

    dispara(x, y) {
        this.posX = x;
        this.posY = y;
        this.disparada = true;
    }

    perdida(){
        this.disparada = false;
    }

    colide(x, y, lar, alt){
        if (!((this.posX > x + lar) || (this.posX + this.larguraObjeto < x) || (this.posY > y + alt) || (this.posY + this.alturaObjeto < y)))
        {
            this.colidiu = true;            
        }
    }

    movimenta(){
        this.posX = this.posX + (this.velocidadeX * this.direcaoX);
        this.posY = this.posY + (this.velocidadeY * this.direcaoY);

        if (this.posY < 0)
        {
            this.disparada = false;
            this.colidiu = false;
        }
    }

    desenhaImagem(){
        if (!this.colidiu)
        {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.posX, this.posY, 5, 30);
            ctx.fillRect(this.posX + 10, this.posY, 5, 30);
        }
    }
}

class Meteoro {
    constructor(nomeImagem, posXInicial, posYInicial, velocidadeX, velocidadeY){
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + nomeImagem + '.png';
        this.largura = this.imagem.width;
        this.altura = this.imagem.height;
        this.numQuadrosImagem = 3;
        this.tempoAnimacao = 5;
        this.tempo = 0;
        this.imgAnimacao = 0;

        this.posX = posXInicial;
        this.posY = posYInicial;
        this.velocidadeX = velocidadeX;
        this.velocidadeY = velocidadeY;
        this.direcaoX = -1;
        this.direcaoY = 0;

        this.larguraObjeto = 100;
        this.alturaObjeto = 100;

        this.colidiu = false;

        this.posX_I = posXInicial;
        this.posY_I = posYInicial;
    }

    colide(x, y, lar, alt){
        if (!((this.posX > x + lar) || (this.posX + this.larguraObjeto < x) || (this.posY > y + alt) || (this.posY + this.alturaObjeto < y)))
        {
            this.colidiu = true;
            somExplosao.play();
        }
    }

    movimenta(){
        this.posX = this.posX + (this.velocidadeX * this.direcaoX);
        this.posY = this.posY + (this.velocidadeY * this.direcaoY);

        if ((this.posY > ALTURA_CANVAS) || (this.posX + this.larguraObjeto < 0) || (this.posX > LARGURA_CANVAS))
        {
            this.colidiu = false;
            this.posX = this.posX_I;
            this.posY = this.posY_I;

            this.direcaoX = Math.pow(-1, (Math.floor(Math.random() * 2))); //1 ou -1
            this.direcaoY = Math.pow(-1, (Math.floor(Math.random() * 2))); //1 ou -1

            const velocidadeMax = 30;

            this.velocidadeX = (Math.floor(Math.random() * velocidadeMax) + 1); //1 a 30
            this.velocidadeY = (Math.floor(Math.random() * velocidadeMax) + 1); //1 a 30

            this.larguraObjeto = (Math.floor(Math.random() * 100) + 50); //50 a 150
            this.alturaObjeto = (Math.floor(Math.random() * 100) + 50); //50 a 150
        }
    }

    desenhaImagem(){
        if (!this.colidiu)
        {
            let posAnimacao = this.imgAnimacao * (this.largura / this.numQuadrosImagem);

            ctx.drawImage(this.imagem, posAnimacao, 0, this.largura / this.numQuadrosImagem, this.altura, this.posX, this.posY, this.larguraObjeto, this.alturaObjeto);
    
            this.tempo = this.tempo + 1;
    
            if (this.tempo == this.tempoAnimacao)
            {
                this.imgAnimacao = (this.imgAnimacao + 1) % this.numQuadrosImagem;
                this.tempo = 0;
            }
        }
    }
}

class ObjetoFundoCenario {
    constructor(nomeImagem, larguraObjeto, alturaObjeto, posXInicial, posYInicial){
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + nomeImagem + '.png';
        this.largura = this.imagem.width;
        this.altura = this.imagem.height;
        this.numQuadrosImagem = 1;

        this.posX = posXInicial;
        this.posY = posYInicial;
        
        class Quadro{
            constructor(imgX, imgY, imgLargura, imgAltura, posX, posY, largura, altura){
                this.imgX = imgX;
                this.imgY = imgY;
                this.imgLargura = imgLargura;
                this.imgAltura = imgAltura;

                this.posX = posX;
                this.posY = posY;
                this.largura = largura;
                this.altura = altura;
            }
        }

        this.quadro1 = new Quadro(posXInicial, this.altura / 2, this.largura, this.altura / 2, posXInicial, posYInicial, this.largura, this.altura / 2);
        this.quadro2 = new Quadro(posXInicial, posYInicial, this.largura, this.altura / 2, this.posX, (this.posY - this.altura / 2), this.largura, this.altura / 2);
    }

    movimenta(){
        this.quadro1.posY = this.quadro1.posY + 1;
        this.quadro2.posY = this.quadro2.posY + 1;
        
        if (this.quadro1.posY > this.altura / 2)
        {
            this.quadro1.posY = this.quadro2.posY - (this.altura / 2);
        }
        if (this.quadro2.posY > this.altura / 2)
        {
            this.quadro2.posY = this.quadro1.posY - (this.altura / 2);
        }
    }

    desenhaImagem(){
        ctx.restore();
        ctx.drawImage(this.imagem, this.quadro1.imgX, this.quadro1.imgY, this.quadro1.imgLargura, this.quadro1.imgAltura, this.quadro1.posX, this.quadro1.posY, this.quadro1.largura, this.quadro1.altura);
        ctx.drawImage(this.imagem, this.quadro2.imgX, this.quadro2.imgY, this.quadro2.imgLargura, this.quadro2.imgAltura, this.quadro2.posX, this.quadro2.posY, this.quadro2.largura, this.quadro2.altura);
    }
}

class CuboDourado{
    constructor(nomeImagem, posXInicial, posYInicial, velocidadeX, velocidadeY){
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + nomeImagem + '.png';
        this.largura = this.imagem.width;
        this.altura = this.imagem.height;

        this.posX = posXInicial;
        this.posY = posYInicial;
        this.velocidadeX = velocidadeX;
        this.velocidadeY = velocidadeY;
        this.direcaoX = 1;
        this.direcaoY = 1;

        this.larguraObjeto = 50;
        this.alturaObjeto = 50;

        this.colidiu = false;
        this.tempoNovo = 0;
    }

    colide(x, y, lar, alt){
        if (!((this.posX > x + lar) || (this.posX + this.larguraObjeto < x) || (this.posY > y + alt) || (this.posY + this.alturaObjeto < y)))
        {
            this.colidiu = true;
            this.posX = LARGURA_CANVAS / 2;
            this.posY = ALTURA_CANVAS / 2;
            this.direcaoX = 1;
            this.direcaoY = 1;
            this.tempoNovo = Math.floor(Math.random() * 2000) + 1000;
        }
    }

    movimenta(){
        if ((this.posX < 0) || (this.posX + this.larguraObjeto > LARGURA_CANVAS))
        {
            this.direcaoX = this.direcaoX * (-1);
        }

        if ((this.posY < 0) || (this.posY + this.alturaObjeto > ALTURA_CANVAS))
        {
            this.direcaoY = this.direcaoY * (-1);
        }

        this.posX = this.posX + (this.velocidadeX * this.direcaoX);
        this.posY = this.posY + (this.velocidadeY * this.direcaoY);
    }

    desenhaImagem(){
        if (!this.colidiu)
        {
            ctx.drawImage(this.imagem, 0, 0, this.largura, this.altura, this.posX, this.posY, 50, 50);
        }
        else
        {
            this.tempoNovo = this.tempoNovo - 1;

            if (this.tempoNovo == 0)
            {
                this.colidiu = false;
            }
        }
    }
}

class ObjMsgInicial {
    constructor() {
        this.imagem = new Image();
        this.imagem.src = LOCAL_IMAGENS + "aviso-inicio.png";

        this.largura = this.imagem.width;
        this.altura = this.imagem.height;
        this.posX = (LARGURA_CANVAS / 2) - (this.largura / 2);
        this.posY = (ALTURA_CANVAS / 2) - (this.altura / 2);

        this.clicou = false;
    }

    clickMouse(mouseX, mouseY){
        if (!((this.posX > mouseX) || (this.posX + this.larguraObjeto < mouseX) || (this.posY > mouseY) || (this.posY + this.alturaObjeto < mouseY)))
        {
            this.clicou = true;
        }
    }

    desenhaImagem(){
        ctx.drawImage(this.imagem, 0, 0, this.largura, this.altura, this.posX, this.posY, this.largura, this.altura);
    }
}

class Relogio{
    constructor(){
        this.hms = '00:00:00';
        this.hora = 0;
        this.minuto = 0;
        this.segundo = 0;
        this.milisegundos = 0;
    }

    atualiza(){
        if (this.milisegundos == 1000)
        {
            this.segundo = this.segundo + 1;
            this.milisegundos = 0;

            if (this.segundo == 60)
            {
                this.minuto = this.minuto + 1;
                this.segundo = 0;

                if (this.minuto == 60)
                {
                    this.hora = this.hora + 1;
                    this.minuto = 0;
                }
            }
        }
        
        this.milisegundos = this.milisegundos + 50;
    }

    desenhaImagem(){
        let hora = this.hora < 10 ? '0' + this.hora : this.hora;
        let minuto = this.minuto < 10 ? '0' + this.minuto : this.minuto;
        let segundo = this.segundo < 10 ? '0' + this.segundo : this.segundo;

        this.hms = hora + ':' + minuto + ':' + segundo + ':' + this.milisegundos;

        ctx.font = "30px Arial";
        ctx.fillText(this.hms, (LARGURA_CANVAS / 2) - 100, 35);
    }
}

function desenhaMensagemInicial()
{
    msgInicial = new ObjMsgInicial();
    msgInicial.desenhaImagem();
}

function verificaClick(mouseX ,mouseY)
{
    msgInicial.clickMouse(mouseX ,mouseY);

    if (msgInicial.clicou)
    {
        iniciaJogo();
    }
}

window.addEventListener('keydown', function (e) {
    e.preventDefault();
    canvas.keys = (canvas.keys || []);
    canvas.keys[e.key] = (e.type == "keydown");

    if ((e.key == 'ArrowUp') || (e.key == 'w')) //SETA CIMA ou W
    {
        jogador.dispara();
    }

    if ((e.key == 'ArrowLeft') || (e.key == 'a')) //SETA BAIXO ou S
    {
        jogador.move(-1);
    }
    else if ((e.key == 'ArrowRight') || (e.key == 'd')) //SETA DIREITA ou D
    {
        jogador.move(1);
    }
})
window.addEventListener('keyup', function (e) {
    canvas.keys[e.key] = (e.type == "keyup");
    jogador.para();
})

canvas.addEventListener('mousedown', e => {
    x = e.offsetX;
    y = e.offsetY;
    verificaClick(x ,y);
  });
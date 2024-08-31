interface DiagramTransform{
    x:number;
    y:number;
    xScale:number;
    yScale:number;
}
class DiagramTransformC{
    x:number;
    y:number;
    xScale:number;
    yScale:number;
    SCALE:number=1;
    constructor(x:number,y:number,xScale:number,yScale:number){
        this.x=x;
        this.y=y;
        this.xScale=xScale;
        this.yScale=yScale;
    }
    public getCanvasX(x:number):number{
        return (x-this.x)*this.xScale*this.SCALE;
    }
    public getCanvasY(y:number):number{
        return (y-this.y)*this.yScale*this.SCALE;
    }

}

export class DiagramCanvas{
    private ctx:CanvasRenderingContext2D;
    private transform:DiagramTransformC=new DiagramTransformC(0,0,1,1);
    private SCALE=1;
    constructor(canvas:HTMLCanvasElement){
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    DrawLine(x1:number,y1:number,x2:number,y2:number,width:number,color:string){
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth=width*this.transform.SCALE;
        this.ctx.moveTo(this.transform.getCanvasX(x1), this.transform.getCanvasY(y1));
        this.ctx.lineTo(this.transform.getCanvasX(x2), this.transform.getCanvasY(y2));
        this.ctx.stroke();
    }


}
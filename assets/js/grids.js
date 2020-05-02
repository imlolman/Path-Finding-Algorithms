class Grids{
    constructor(w, h){
        this.grids = []
        this.b = [0,0]
        this.e = [2,2]
        for(var i = gridSize + gridGap; i <= h; i += gridSize + gridGap){
            var rows = []
            for(var j = gridSize + gridGap; j <= w; j += gridSize + gridGap){
                if(j > w/2){
                    rows.push("w")
                }else{
                    rows.push("")
                }
            }
            this.grids.push(rows)
            this.offsetX = (w-(j - gridSize - gridGap))/2
        }
        this.offsetY = (h-(i - gridSize - gridGap))/2
        this.maxX = this.grids[0].length
        this.maxY = this.grids.length
        this.grids[this.b[0]][this.b[1]] = "b"
        this.grids[this.e[0]][this.e[1]] = "e"
    }

    display = function(){
        for(var [ri,row] of this.grids.entries()){
            for(var [ci,cell] of row.entries()){
                var topX = ci*(gridSize+gridGap) + gridGap + this.offsetX
                var topY = ri*(gridSize+gridGap) + gridGap + this.offsetY
                var fc = [36, 36, 36]
                if(cell == "w"){
                    fc = [20,20,20]
                }
                if(cell == "b"){
                    fc = [255, 0, 0]
                }
                if(cell == "e"){
                    fc = [0, 171, 28]
                }
                if(cell == "p"){
                    fc = [220, 235, 113]
                }
                if(cell == "ex"){
                    fc = [212, 97, 85]
                }

                if(mouseX > topX && mouseX < topX+gridSize && mouseY > topY && mouseY < topY + gridSize){
                    if(mouseIsPressed){
                        if(inputMode == "wall"){
                            this.grids[ri][ci] = "w"
                        }
                        if(inputMode == "begin"){
                            if(this.grids[this.b[0]][this.b[1]] == "b"){
                                this.grids[this.b[0]][this.b[1]] = ""
                            }
                            this.b = [ri,ci]
                            this.grids[ri][ci] = "b"
                        }
                        if(inputMode == "end"){
                            if(this.grids[this.e[0]][this.e[1]] == "e"){
                                this.grids[this.e[0]][this.e[1]] = ""
                            }
                            this.e = [ri,ci]
                            this.grids[ri][ci] = "e"
                        }
                        if(inputMode == "blank"){
                            this.grids[ri][ci] = ""
                        }
                    }
                    if(cell == ""){
                        fc.push(175)
                    }
                }

                fill(fc)
                strokeWeight(0)
                rect(topX, topY, gridSize, gridSize)
            }
        }
    }

    neighhours = function(node){
        var y = node.y
        var x = node.x
        var tr = []
        tr.push([y,x-1])
        tr.push([y,x+1])
        tr.push([y+1,x])
        tr.push([y-1,x])
        tr = tr.filter((t) => {
            if(t[0] >= 0 && t[0] < this.maxY && t[1] >= 0 && t[1] < this.maxX && this.grids[t[0]][t[1]] != "w"){
                return true
            }
        })
        tr = tr.map((t) => {
            var n = new Node(t[0],t[1])
            n.parent = node
            return n
        })
        return tr
    }

    solve = function(){
        if(this.e.equals(this.b)){
            alert('make start and end different');
            return
        }

        this.resetGrid()

        var searchType = document.getElementsByName("searchType")[0].value

        var frontier = new StackFrontier()
        if(searchType == "Astar"){
            var frontier = new StackFrontier(true,this.e)
        }
        if(searchType == "bfs"){
            var frontier = new QueueFrontier()
        }
        frontier.add(new Node(this.b[0],this.b[1]))

        var explored = []

        var foundRoute = false;

        while(!frontier.isEmpty()){
            /* Getting last node from frontier */
            var node = frontier.remove()

            /* Checking if this is the destination */
            if(this.e.equals([node.y,node.x])){
                var foundRoute = true
                this.markSolution(node.parent,explored)
                break
            }

            var neighhours = this.neighhours(node)

            /* Sorting if this greedy best first search algo */
            if(searchType == "gbfs"){
                neighhours = neighhours.sort((a,b) => {
                    return  (Math.abs(this.e[0] - b.y) + Math.abs(this.e[1] - b.x))  - (Math.abs(this.e[0] - a.y) + Math.abs(this.e[1] - a.x))
                })
                neighhours.forEach(neighhour => {
                    if(!checkArrayContainsArray(explored,[neighhour.y,neighhour.x])){
                        frontier.add(neighhour)
                    }
                })
            }else{
                neighhours.forEach(neighhour => {
                    if(!frontier.contains(neighhour) && !checkArrayContainsArray(explored,[neighhour.y,neighhour.x])){
                        frontier.add(neighhour)
                    }
                })
            }

            /* Adding this node to explored */
            explored.push([node.y,node.x])
        }

        if(!foundRoute){
            document.getElementsByClassName("msgBox")[0].style.display = "flex"
            this.markSolution(this.b,explored)
        }
    }

    markSolution = function(node,explored){
        if(showExplored){
            while(explored.length != 1){
                var ex = explored.pop()
                this.grids[ex[0]][ex[1]] = "ex"
            }
        }
        while(node.parent != null){
            this.grids[node.y][node.x] = "p"
            node = node.parent;
        }
    }

    resetGrid = function(){
        for(var [ri,row] of this.grids.entries()){
            for(var [ci,cell] of row.entries()){
                if(this.grids[ri][ci] == "ex" || this.grids[ri][ci] == "p"){
                    this.grids[ri][ci] = ""
                }
            }
        }
    }
}

class Node{
    constructor(y,x){
        this.y = y;
        this.x = x;
        this.parent = null;
    }
}


class StackFrontier{
    constructor(isAstar = false, e = [0,0]){
        this.e = e
        this.isAstar = isAstar
        this.data = []
    }

    isEmpty = function() {
        return this.data.length == 0
    }

    contains = function(node){
        for(var d of this.data){
            if(node.y == d.y && node.x == d.x){
                return true
            }
        }
        return false
    }

    add = function(node) {
        this.data.push(node)
    }

    remove = function(){
        if(this.isEmpty()){
            throw "Stack is Empty"
        }
        if(this.isAstar){
            this.data.sort((a,b) => {
                return  (Math.abs(this.e[0] - b.y) + Math.abs(this.e[1] - b.x))  - (Math.abs(this.e[0] - a.y) + Math.abs(this.e[1] - a.x))
            })
        }
        return this.data.pop()
    }
}


class QueueFrontier extends StackFrontier{
    remove = function(){
        if(this.isEmpty()){
            throw "Stack is Empty"
        }
        return this.data.shift()
    }
}

function checkArrayContainsArray(bigArray,smallArray){
    for(var a of bigArray){
        if(a.equals(smallArray)){
            return true
        }
    }
    return false
}
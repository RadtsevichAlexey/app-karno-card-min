var container;
			var expression;

			var camera, scene, renderer;
			var cube, plane;

			var targetRotationX = 0;
			var targetRotationOnMouseDownX = 0;
			
			var targetRotationY = 0;
			var targetRotationOnMouseDownY = 0;
			
			var mouseX = 0;
			var mouseXOnMouseDown = 0;
			
			var mouseY = 0;
			var mouseYOnMouseDown = 0;
			
			var NumOfVars = document.DataInput.NumOfVars.value;
			var BinPow = Math.pow(2,NumOfVars);
			var size = 20;
			var gap_plus_size = size + 4;
			
			var PlaneOpacity = 0.7;
			var GROUPS = [];
			var list_of_groups = [];
			
			var poses = [
			[[1,0],[0,0]],
			[[1,1],[1,0],[0,1],[0,0]],
			[[3,1],[2,1],[3,0],[2,0],[0,1],[1,1],[0,0],[1,0]],
			[[3,3],[3,2],[2,3],[2,2],[3,0],[3,1],[2,0],[2,1],[0,3],[0,2],[1,3],[1,2],[0,0],[0,1],[1,0],[1,1]],
			[[7,3],[6,3],[7,2],[6,2],[4,3],[5,3],[4,2],[5,2],[7,0],[6,0],[7,1],[6,1],[4,0],[5,0],[4,1],[5,1],
				[0,3],[1,3],[0,2],[1,2],[3,3],[2,3],[3,2],[2,2],[0,0],[1,0],[0,1],[1,1],[3,0],[2,0],[3,1],[2,1]],
			[[7,7],[7,6],[6,7],[6,6],[7,4],[7,5],[6,4],[6,5],[4,7],[4,6],[5,7],[5,6],[4,4],[4,5],[5,4],[5,5],
				[7,0],[7,1],[6,0],[6,1],[7,3],[7,2],[6,3],[6,2],[4,0],[4,1],[5,0],[5,1],[4,3],[4,2],[5,3],[5,2],
				[0,7],[0,6],[1,7],[1,6],[0,4],[0,5],[1,4],[1,5],[3,7],[3,6],[2,7],[2,6],[3,4],[3,5],[2,4],[2,5],
				[0,0],[0,1],[1,0],[1,1],[0,3],[0,2],[1,3],[1,2],[3,0],[3,1],[2,0],[2,1],[3,3],[3,2],[2,3],[2,2]]
			];

			var groupCubes = new THREE.Group();
			var groupPlanes = new THREE.Group();
			
			var canvas = document.getElementById("2DimKC");
			var ctx = canvas.getContext("2d");
						
			var colors = [[2,0,0],[0.5,2,0.5],[0,2,2],[2,0,2],[0.5,0,1],[0,2,0],[2,2,0],[2,0.5,2],[2,2,0],[0,0,2],[0.5,0.5,2],[1,1,0],[0.5,0,0],[0,0.5,0],[0,0,0.5],[1,1,1]];
			
			var group_colors = [];
			
			// var cur_year = 1970+Math.floor(new Date().getTime()/(1000*60*60*24*365));
			// alert("Год:" + cur_year);
			if(!Detector.webgl)
				alert("Внимание, ваш браузер не поддерживает WebGLRenderer. В связи с этим могут возникнуть проблемы с производительностью. Для беспрепядственного использования данного ресурса смените браузер.");
			
			var examples = ['0000000001000000000000000100000000000000010000000000000001000000','0000000000000011000000000000001100000000000000110000000000000011','0001000000000000000100000000000000010000000000000001000000000000','0001000100010001000100010001000100010001000100010001000100010001','0001000000000001000100000000000100010000000000010001000000000001','0000000000000110000000000000011000000000000001100000000000000110','0001000000000110000100000000011000010000000001100001000000000110','0001001001000000000100100100000000010010010000000001001001000000','0001001101010000000100110101000000010011010100000001001101010000','0000000000000111000000000000011100000000000001110000000000000111','0000001001000000000000100100000000000010010000000000001001000000','0000000100010000000000010001000000000001000100000000000100010000','0000000100010110000000010001011000000001000101100000000100010110','0000000100010001000000010001000100000001000100010000000100010001','1001000000001001100100000000100110010000000010011001000000001001','1001001001000001100100100100000110010010010000011001001001000001'];
			
			init();
			animate();
			
			
			//Инициализация рабочей области
			function init()
			{	
				//Инициализация контейнера
				container = document.getElementById('container');
				
				//Камера
				camera = new THREE.PerspectiveCamera( 70, 1, 1, 1000 );
				camera.position.z = 60 + 20*(NumOfVars);
				
				//Создание сцены
				scene = new THREE.Scene();
				
				//Создание полукарт
				Plane();
				
				//Создание ячеек
				Cube();
						
				//Вывод созданных элементов на сцену
				scene.add(groupCubes);
				scene.add(groupPlanes);
				
				//Создание двухмерной модели КК
				ctx.clearRect(0,0,420,420);
				drawKarnaughcard(NumOfVars);
				drawHalfCards(NumOfVars);
				
				//Создание рендерера
				if(Detector.webgl)
				{
					renderer = new THREE.WebGLRenderer({antialias:true});
					renderer.clearDepth();
				}
				else
					renderer = new THREE.CanvasRenderer();
					
				renderer.setClearColor(0xffffff);
				renderer.setSize(420, 420);
				renderer.render(scene,camera);
				container.appendChild(renderer.domElement);
			
				//События мыши для вращения КК
				container.addEventListener('mousedown', onDocumentMouseDown, false);
				container.addEventListener('touchstart', onDocumentTouchStart, false);
				container.addEventListener('touchmove', onDocumentTouchMove, false);
			}
					
			//Визуализация групп ячеек 
			function Group(id)//3 4 5 6
			{
				var size = (4-Math.ceil(NumOfVars/2))*40;// 1,2: 120, 3,4: 80, 5,6: 40	
				var width = Math.pow(2,Math.ceil(NumOfVars/2));
				var height = Math.pow(2,Math.floor(NumOfVars/2));
				var gap = (4-Math.ceil(NumOfVars/2))*3;
				var x_shift = 210 - 20*(NumOfVars==6);
				var y_shift = 210 + 10*(NumOfVars==6);
				list_of_groups = MakeLogExpression(GROUPS[id]); 
				
				ctx.font = size/2+'px sans-serif';	
				document.getElementById('group').innerHTML += '<p><input type="checkbox" name="groupAll" id="groupAll" value="All" onchange="onAllGroupsChange('+id+')" checked><br></p>';

				document.getElementById("group").style.height = (document.getElementById("group").style.height.substr(0,document.getElementById("group").style.height.length-2)-16) +'px';
				
				for(var group = 0; group < GROUPS[id].length; group++)
				{
					for(var cell = 0; cell < GROUPS[id][group].length; cell++)
					{
						var RectX = x_shift-(width/2 - poses[NumOfVars-1][GROUPS[id][group][cell]][0])*size+gap/2;
						var RectY = y_shift-(height/2 - poses[NumOfVars-1][GROUPS[id][group][cell]][1])*size+gap/2;
						
						groupCubes.children[GROUPS[id][group][cell]].material.color.r *= group_colors[GROUPS[id][group][cell]];
						groupCubes.children[GROUPS[id][group][cell]].material.color.g *= group_colors[GROUPS[id][group][cell]];
						groupCubes.children[GROUPS[id][group][cell]].material.color.b *= group_colors[GROUPS[id][group][cell]];
						
						group_colors[GROUPS[id][group][cell]]++;
						
						groupCubes.children[GROUPS[id][group][cell]].material.color.r += colors[group%16][0];
						groupCubes.children[GROUPS[id][group][cell]].material.color.r /= group_colors[GROUPS[id][group][cell]];
							
						groupCubes.children[GROUPS[id][group][cell]].material.color.g += colors[group%16][1];
						groupCubes.children[GROUPS[id][group][cell]].material.color.g /= group_colors[GROUPS[id][group][cell]];
						
						groupCubes.children[GROUPS[id][group][cell]].material.color.b += colors[group%16][2];
						groupCubes.children[GROUPS[id][group][cell]].material.color.b /= group_colors[GROUPS[id][group][cell]];
						
						ctx.clearRect(RectX,RectY,size-gap,size-gap);
						
						ctx.globalAlpha = 0.7;
						//console.log('rgb('+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.r*255)+','+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.g*255)+','+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.b*255)+')');
						
						//document.getElementById("group").input[type=checkbox].style.color = 'rgb('+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.r*255)+','+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.g*255)+','+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.b*255)+')';
						
						ctx.fillStyle = 'rgb('+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.r*255)+','+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.g*255)+','+Math.round(groupCubes.children[GROUPS[id][group][cell]].material.color.b*255)+')';
						
						ctx.fillRect(RectX,RectY,size-gap,size-gap);
						
						
						ctx.globalAlpha = 1;
						ctx.fillStyle = "black";	
						ctx.fillText(expression[GROUPS[id][group][cell]],RectX+size*.3,RectY+size*.6);
					}
					document.getElementById('group').innerHTML += '<p><input type="checkbox" id=group'+group+' name="group' + group + '" value="' + group + '" onchange="onGroupChange(document.KarnaughSets.group' + group + '.value,document.KarnaughSets.group' + group + '.checked,'+id+')" checked><label for="group'+group+'">' + list_of_groups[group] + '</label><br></p>';
				}
				//console.log(document.KarnaughSets);
			}
			
			function ChangeExp(id)
			{
				document.getElementById('group').innerHTML = '';
				ReloadValues();
				list_of_groups = MakeLogExpression(GROUPS[id]); 
				Group(id); 
			}
			
			function KAL()
			{
				var start = new Date().getTime();
				document.getElementById("exps").innerHTML = '';
				GROUPS = calculate();
				if(GROUPS === 0)
					return 0;
				ReloadValues();
				for(var i = 0; i < GROUPS.length; i++)
				{
					list_of_groups = MakeLogExpression(GROUPS[i]); 
					document.getElementById("exps").innerHTML += "<input type='radio' name='VarRow' onchange='ChangeExp("+i+");'  id='VarRow"+i+"'><label for='VarRow"+i+"'>"+list_of_groups.join(out_br)+"</label>";
				}
				document.getElementById("VarRow0").checked = true;
				Group(0);
				console.log("Espression: "+expression+";");
				console.log("Results: "+GROUPS.length+";");
				console.log("Time: "+(new Date().getTime() - start)/1000+";");	
				console.log("-----	")				
			}
			
			function onAllGroupsChange(id)
			{
				
				var groupCont = document.KarnaughSets;
				//console.log(groupCont.length);
				for(var checkbox = 3; checkbox < groupCont.length; checkbox++)
				{
					//console.log(groupCont[checkbox].value);
					if(groupCont[checkbox].checked != groupCont.groupAll.checked)
					{
						groupCont[checkbox].checked = groupCont.groupAll.checked;
						onGroupChange(checkbox-3, groupCont.groupAll.checked, id);
					}
				}
			}
			
			function onGroupChange(value, checked,id)
			{
				
				var size = (4-Math.ceil(NumOfVars/2))*40;// 1,2: 120, 3,4: 80, 5,6: 40	
				var width = Math.pow(2,Math.ceil(NumOfVars/2));
				var height = Math.pow(2,Math.floor(NumOfVars/2));
				var gap = (4-Math.ceil(NumOfVars/2))*3;
				ctx.font = size/2+'px sans-serif';
				var x_shift = 210 - 20*(NumOfVars==6);
				var y_shift = 210 + 10*(NumOfVars==6);
				
				for(var cell = 0; cell < GROUPS[id][value].length; cell++) 
				{
					var RectX = x_shift-(width/2 - poses[NumOfVars-1][GROUPS[id][value][cell]][0])*size+gap/2;
					var RectY = y_shift-(height/2 - poses[NumOfVars-1][GROUPS[id][value][cell]][1])*size+gap/2;

					groupCubes.children[GROUPS[id][value][cell]].material.color.r *= group_colors[GROUPS[id][value][cell]];
					groupCubes.children[GROUPS[id][value][cell]].material.color.g *= group_colors[GROUPS[id][value][cell]];
					groupCubes.children[GROUPS[id][value][cell]].material.color.b *= group_colors[GROUPS[id][value][cell]];
					
					groupCubes.children[GROUPS[id][value][cell]].material.color.r += Math.pow(-1,!checked)*colors[value%16][0];
					groupCubes.children[GROUPS[id][value][cell]].material.color.g += Math.pow(-1,!checked)*colors[value%16][1];
					groupCubes.children[GROUPS[id][value][cell]].material.color.b += Math.pow(-1,!checked)*colors[value%16][2];
					
					group_colors[GROUPS[id][value][cell]] += Math.pow(-1,!checked);
						
					groupCubes.children[GROUPS[id][value][cell]].material.color.r /= group_colors[GROUPS[id][value][cell]];
					groupCubes.children[GROUPS[id][value][cell]].material.color.g /= group_colors[GROUPS[id][value][cell]];
					groupCubes.children[GROUPS[id][value][cell]].material.color.b /= group_colors[GROUPS[id][value][cell]];
					
					ctx.clearRect(RectX,RectY,size-gap,size-gap);
						
					ctx.globalAlpha = 0.7;
					//console.log('rgb('+Math.round(groupCubes.children[GROUPS[id][value][cell]].material.color.r*255)+','+Math.round(groupCubes.children[GROUPS[id][value][cell]].material.color.g*255)+','+Math.round(groupCubes.children[GROUPS[id][value][cell]].material.color.b*255)+')');
					ctx.fillStyle = 'rgb('+Math.round(groupCubes.children[GROUPS[id][value][cell]].material.color.r*255)+','+Math.round(groupCubes.children[GROUPS[id][value][cell]].material.color.g*255)+','+Math.round(groupCubes.children[GROUPS[id][value][cell]].material.color.b*255)+')';
						
					ctx.fillRect(RectX,RectY,size-gap,size-gap);
					
					ctx.globalAlpha = 1;
					ctx.fillStyle = "black";	
					ctx.fillText(expression[GROUPS[id][value][cell]],RectX+size*.3,RectY+size*0.6);
				}
			}
			
			//Изменение яркости полукарт
			function ChangePLanes(NewOpacity)
			{
				for(var child = 0; child < groupPlanes.children.length; child++)
					groupPlanes.children[child].material.opacity = NewOpacity;  
			}
			
			//Изменение прозрачности пустых ячеек
			function ChangeCells(NewOpacity)
			{
				var BinPow = Math.pow(2,NumOfVars);
				var ExpressionValue = document.DataInput.MM.value;
				for(var child = 0; child < BinPow; child++)
					if(expression[child] != ExpressionValue)
					{
						groupCubes.children[child].material.opacity = NewOpacity;
						groupCubes.children[child + BinPow].material.opacity = 1.43*NewOpacity;
						if(NewOpacity < 0.05)
							groupCubes.children[child + BinPow].renderOrder = 2;
						else
							groupCubes.children[child + BinPow].renderOrder = 1;
					}
			}
			
			//Переинициализация
			function ReloadKC()
			{
				document.getElementById("exps").innerHTML = '';
				NumOfVars = document.DataInput.NumOfVars.value;
				BinPow = Math.pow(2,NumOfVars);
				
				groupCubes = new THREE.Group();
				groupPlanes = new THREE.Group();
				Scene = null;
				container.removeChild(renderer.domElement);
				container = null;
				camera = null;
				document.getElementById('group').innerHTML = '';
				init();
				animate();
			}
			
			//Перезагрузка значений
			function ReloadValues()
			{	
				NumOfVars = document.DataInput.NumOfVars.value;
				expression = document.DataInput.exp.value;
				BinPow = Math.pow(2,NumOfVars);
				
				PlaneOpacity = document.KarnaughSets.PlaneOpacity.value;
				ctx.clearRect(0,0,420,420);
				drawKarnaughcard(NumOfVars);
				drawHalfCards(NumOfVars);

				document.KarnaughSets.EmptyCellOpacity.value = 1;
				
				groupCubes.children = groupCubes.children.slice(0,BinPow);
				
				for(var child = 0; child < BinPow; child++)
					groupCubes.children[child].material.opacity = 0.7;

				ctx.fillStyle = "black";
				ctx.globalAlpha = 1; 
				
				var size = (4-Math.ceil(NumOfVars/2))*40;// 1,2: 120, 3,4: 80, 5,6: 40	
				var width = Math.pow(2,Math.ceil(NumOfVars/2));
				var height = Math.pow(2,Math.floor(NumOfVars/2));
				var gap = (4-Math.ceil(NumOfVars/2))*3;
				ctx.font = size/2+'px sans-serif';
				var x_shift = 210 - 20*(NumOfVars==6);
				var y_shift = 210 + 10*(NumOfVars==6);
				
				for(var child = 0; child < BinPow; child++)
				{
					var RectX = x_shift-(width/2 - poses[NumOfVars-1][child][0])*size+gap/2;
					var RectY = y_shift-(height/2 - poses[NumOfVars-1][child][1])*size+gap/2;
					groupCubes.children[child].material.color.r = 0.75;
					groupCubes.children[child].material.color.g = 0.75;
					groupCubes.children[child].material.color.b = 0.75;
					group_colors[child] = 1;
					
					//Создание трехмерного текста
					text3d = new THREE.TextGeometry(expression[child],{size: 15, height: 2, font: "gentilis", curveSegments: 1});
					TextMaterial = new THREE.MeshBasicMaterial({color: 0x000000, overdraw: 0.5, opacity: 1, transparent: true});
					text = new THREE.Mesh(text3d, TextMaterial);
					text.position.set(groupCubes.children[child].position.x - 5, groupCubes.children[child].position.y - 6, groupCubes.children[child].position.z - 1);
					text.renderOrder = 1;
					groupCubes.add(text);
					
					//Создание двухмерного текста
					ctx.fillText(expression[child],RectX+size*.3,RectY+size*0.6);
				}

				scene.add(groupCubes);
				scene.add(groupPlanes);
				document.getElementById('group').innerHTML = '';
			}
			
			//Создание ячеек(3D)
			function Cube()
			{	
				//Вычисление разположения и размеров объектов сцены
				var MaxCount = [1,1,1];
				var MaxCountPx = [1,1,1];
				
				for(var i = 0; i < NumOfVars; i++)
					MaxCountPx[i%3] *= 2;
				
				for(i = 2; i + 1; i--)
					MaxCount[i] = (MaxCountPx[i] - 1)*(gap_plus_size)/2;

				var pos = [0,0,0];
				var StartCount = [0,0,0];
				var end;
				
				BinPow > 8 ? end = 8 : end = BinPow;
						
				for(var shift = 0; shift < Math.ceil(BinPow/8); shift++)
				{
					var count = (NumOfVars-1)%3;
					if(shift == 0)
						for(var coor = 0; coor < 3; coor++)
						{
							StartCount[coor] = -MaxCount[coor];
							MaxCount[coor] -= (NumOfVars > 3+coor)*2*gap_plus_size;
						}
					
					
						
					if(shift%2 == 1)
					{
						StartCount[count] = -StartCount[count];
						MaxCount[count] = -MaxCount[count];
					}
						
					if(shift%4 == 2)
					{
						StartCount[count-1] = -StartCount[count-1];
						MaxCount[count-1] = -MaxCount[count-1];
						StartCount[count] = -StartCount[count];
						MaxCount[count] = -MaxCount[count];
					}
					
					if(shift%8 == 4)
					{
						StartCount[0] = -StartCount[0];
						MaxCount[0] = -MaxCount[0];
						StartCount[1] = -StartCount[1];
						MaxCount[1] = -MaxCount[1];
						StartCount[2] = -StartCount[2];
						MaxCount[2] = -MaxCount[2];
					}
					
					for(var coor = 0; coor < 3; coor++)
						pos[coor] = StartCount[coor];

					//for(var j = 0; j <= (NumOfVars-1)%3; j++)
					pos[count] -= Math.pow(-1,(shift%2))*gap_plus_size;
					
					for(var i = 0; i < end; i++)
					{
						var count = (NumOfVars-1)%3;
						while(pos[count] == MaxCount[count])
						{
							pos[count] = StartCount[count--];
							if(count < 0)
								count = 2;
						}
						
						var geometry = new THREE.BoxGeometry(size, size, size);
						var material = new THREE.MeshBasicMaterial({color: 0xc0c0c0/*map: THREE.ImageUtils.loadTexture('cell_texture.jpg')*/, opacity: 0.7,transparent: true});
						pos[count] += Math.pow(-1,!(shift%Math.pow(2,(NumOfVars-3) + Math.pow(-1,NumOfVars > 4)*count)<Math.pow(2,(NumOfVars-4) + Math.pow(-1,NumOfVars > 4)*count)))*gap_plus_size;
						group_colors.push(1);
						cube = new THREE.Mesh(geometry, material);//							  	 							 	  + - + - + - + -					  + + - - + + - - 					 + + + + - - - -
						cube.renderOrder = 2;
						cube.position.set(pos[0], pos[1], pos[2]);
						groupCubes.add(cube);
					}
				}
			}
			
			//Создание плоскостей(3D)
			function Plane()
			{		
				//Вычисление разположения и размеров объектов сцены
				var MaxCount = [1,1,1];
				var MaxCountPx = [1,1,1];
				
				for(var i = 0; i < NumOfVars; i++)
					MaxCountPx[i%3] *= 2;
				
				for(i = 2; i + 1; i--)
					MaxCount[i] = (MaxCountPx[i] - 1)*(gap_plus_size)/2;
									
				var buf = MaxCountPx.shift();
				MaxCountPx.push(buf);
				
				var form = document.DataInput.MM.value;
				var text_pos = [];
				var TextMaterial = new THREE.MeshBasicMaterial({color: 0x000000, overdraw: 0.5, opacity: PlaneOpacity, transparent: true});
				var material = new THREE.MeshBasicMaterial({color: 0x757575, overdraw: 0.5, opacity: PlaneOpacity, transparent: true});
				var max = 2;
				//Вычисление расположения и размеров полукарт
				for(i = 0; i < NumOfVars; i++)
				{
					var not = '';
					if(form == '1')
						var not = '¬';
					var count = 2;
					var plane_size = [size + (MaxCountPx[i%3] - 1)*gap_plus_size,size + gap_plus_size*Math.floor(NumOfVars/(4 + i))];
					if(i < 3)
					{
						var num = -1;
						var plane_pos = [(gap_plus_size/2)*Math.ceil(NumOfVars/(3 + i)),0,- 30 - MaxCount[count]];
					}
					else
					{
						max = 3;
						var num = 1;
						var plane_pos = [gap_plus_size + size/2,0,30 + MaxCount[5-i]];
					}
					
					for(var iter = 0; iter < i%3; iter++)
					{
						var buf = plane_pos.pop();
						plane_pos.unshift(buf);
						count++;
						if(count > 2)
							count = 0;
					}
							
					plane_pos[count] = num*(30 + MaxCount[count]);
					
					for(var sign = 0; sign < max; sign ++)
					{
						plane_pos[i%3] *= -1;
						if(sign == 2)
						{
							var not = '¬';
							if(form == '1')
								var not = '';
							plane_pos[i%3] = 0;
							plane_size[1] += gap_plus_size;
						}
						
						//Создание полукарты
						var geometry = new THREE.PlaneBufferGeometry(plane_size[0], plane_size[1]);
						angle_set = [0,0,0];
						angle_set[(5 - i)%3] = -Math.PI/2;
						plane = new THREE.Mesh(geometry, material);
						plane.material.side = THREE.DoubleSide;
						plane.renderOrder = 2;
						plane.rotation.set(angle_set[0], angle_set[1], angle_set[2])
						plane.position.set(plane_pos[0], plane_pos[1], plane_pos[2]);
						groupPlanes.add(plane);
						
						//Создание текста
						text_pos[0] = plane_pos[0]
						text_pos[1] = plane_pos[1]
						text_pos[2] = plane_pos[2]
						
						if(count != 0)
							text_pos[count-1] = MaxCount[count-1] + 20
						else
							text_pos[2] = MaxCount[2] + 20
							
						if((i<3)&&(sign == 1))
						{
							var not = '¬';
							if(form == '1')
								var not = '';
						}
						
						var text3d = new THREE.TextGeometry(not + 'X' + i,{size: 5, height: 0.5, font: "gentilis", curveSegments: 1});
						text = new THREE.Mesh(text3d, TextMaterial);
						text.renderOrder = 2;
						text.rotation.set(angle_set[0], angle_set[1], 0);
						text.position.set(text_pos[0], text_pos[1], text_pos[2]);
						groupPlanes.add(text);
				
					}
				}
			}
			
			function drawHalfCards(NumOfVars)
			{
				var form = document.DataInput.MM.value;
				var InvSigns = ['','\u0305'];
				
				if(form == '0')//Проверка на мкнф
					InvSigns.reverse();
					
				var UniId = ['\u2080','\u2081','\u2082','\u2083','\u2084','\u2085'];
				var size = (4-Math.ceil(NumOfVars/2))*40;// 1,2: 120, 3,4: 80, 5,6: 40	
				var width = Math.pow(2,Math.ceil(NumOfVars/2));
				var height = Math.pow(2,Math.floor(NumOfVars/2));
				var gap = (4-Math.ceil(NumOfVars/2))*3;
				var x_shift = 210 - 20*(NumOfVars==6);
				var y_shift = 210 + 10*(NumOfVars==6);
				
				ctx.font = size/2+'px Arial';
				ctx.globalAlpha = 1;	
				ctx.fillStyle = "black";
				ctx.strokeStyle = "3px"
				ctx.beginPath();			
				
				switch(NumOfVars)
				{
					case "6":
						//x5
						ctx.moveTo(x_shift+(1+width/2)*size,y_shift-(height/2)*size+gap/2);
						ctx.lineTo(x_shift+(1+width/2)*size,y_shift-3*(height/8)*size-gap/2);
						ctx.fillText('X' + InvSigns[1] + UniId[5],x_shift+(1+width/2)*size+gap,y_shift-(height/2)*size+5*gap);
							
						ctx.moveTo(x_shift+(1+width/2)*size,y_shift-3*(height/8)*size+gap/2);
						ctx.lineTo(x_shift+(1+width/2)*size,y_shift-(height/8)*size-gap/2);
						ctx.fillText('X' + InvSigns[0] + UniId[5],x_shift+(1+width/2)*size+gap,y_shift-(height/4)*size+2*gap);
							
						ctx.moveTo(x_shift+(1+width/2)*size,y_shift-(height/8)*size+gap/2);
						ctx.lineTo(x_shift+(1+width/2)*size,y_shift+(height/8)*size-gap/2);
						ctx.fillText('X' + InvSigns[1] + UniId[5],x_shift+(1+width/2)*size+gap,y_shift+gap/2);
							
						ctx.moveTo(x_shift+(1+width/2)*size,y_shift+(height/8)*size+gap/2);
						ctx.lineTo(x_shift+(1+width/2)*size,y_shift+3*(height/8)*size-gap/2);
						ctx.fillText('X' + InvSigns[0] + UniId[5],x_shift+(1+width/2)*size+gap,y_shift+(height/4)*size+2*gap);
						
						ctx.moveTo(x_shift+(1+width/2)*size,y_shift+3*(height/8)*size+gap/2);
						ctx.lineTo(x_shift+(1+width/2)*size,y_shift+(height/2)*size-gap/2);
						ctx.fillText('X' + InvSigns[1] + UniId[5],x_shift+(1+width/2)*size+gap,y_shift+(height/2)*size-2*gap);
							
					case "5":
						//x4
						ctx.moveTo(x_shift-(width/2)*size+gap/2,y_shift-(1+height/2)*size+gap);
						ctx.lineTo(x_shift-3*(width/8)*size-gap/2,y_shift-(1+height/2)*size+gap);
						ctx.fillText('X' + InvSigns[1] + UniId[4],x_shift-(width/2)*size+2*gap,y_shift-(1+height/2)*size-5+gap);
						
						ctx.moveTo(x_shift-3*(width/8)*size+gap/2,y_shift-(1+height/2)*size+gap);
						ctx.lineTo(x_shift-(width/8)*size-gap/2,y_shift-(1+height/2)*size+gap);
						ctx.fillText('X' + InvSigns[0] + UniId[4],x_shift-(width/4)*size-2*gap,y_shift-(1+height/2)*size-5+gap);
							
						ctx.moveTo(x_shift-(width/8)*size+gap/2,y_shift-(1+height/2)*size+gap);
						ctx.lineTo(x_shift+(width/8)*size-gap/2,y_shift-(1+height/2)*size+gap);
						ctx.fillText('X' + InvSigns[1] + UniId[4],x_shift-2*gap,y_shift-(1+height/2)*size-5+gap);
							
						ctx.moveTo(x_shift+(width/8)*size+gap/2,y_shift-(1+height/2)*size+gap);
						ctx.lineTo(x_shift+3*(width/8)*size-gap/2,y_shift-(1+height/2)*size+gap);
						ctx.fillText('X' + InvSigns[0] + UniId[4],x_shift+(width/4)*size-2*gap,y_shift-(1+height/2)*size-5+gap);
						
						ctx.moveTo(x_shift+3*(width/8)*size+gap/2,y_shift-(1+height/2)*size+gap);
						ctx.lineTo(x_shift+(width/2)*size-gap/2,y_shift-(1+height/2)*size+gap);
						ctx.fillText('X' + InvSigns[1] + UniId[4],x_shift+3*(width/8)*size+2*gap,y_shift-(1+height/2)*size-5+gap);
					
					case "4":
						//x3
						ctx.moveTo(x_shift-(width/2)*size-gap,y_shift-(height/2)*size+gap/2);
						ctx.lineTo(x_shift-(width/2)*size-gap,y_shift-(height/4)*size-gap/2);
						ctx.fillText('X' + InvSigns[1] + UniId[3],x_shift-(width/2)*size-size/2-3*gap/2,y_shift-3*(height/8)*size+gap);
							
						ctx.moveTo(x_shift-(width/2)*size-gap,y_shift-(height/4)*size+gap/2);
						ctx.lineTo(x_shift-(width/2)*size-gap,y_shift+(height/4)*size-gap/2);
						ctx.fillText('X' + InvSigns[0] + UniId[3],x_shift-(width/2)*size-size/2-3*gap/2,y_shift+gap/2);
						
						ctx.moveTo(x_shift-(width/2)*size-gap,y_shift+(height/4)*size+gap/2);
						ctx.lineTo(x_shift-(width/2)*size-gap,y_shift+(height/2)*size-gap/2);
						ctx.fillText('X' + InvSigns[1] + UniId[3],x_shift-(width/2)*size-size/2-3*gap/2,y_shift+3*(height/8)*size+gap);
						
					case "3":
						//x2
						ctx.moveTo(x_shift-(width/2)*size+gap/2,y_shift+(height/2)*size+gap);
						ctx.lineTo(x_shift-(width/4)*size-gap/2,y_shift+(height/2)*size+gap);
						ctx.fillText('X' + InvSigns[1] + UniId[2],x_shift-3*(width/8)*size-gap,y_shift+(height/2)*size+size/2+gap);
							
						ctx.moveTo(x_shift-(width/4)*size+gap/2,y_shift+(height/2)*size+gap);
						ctx.lineTo(x_shift+(width/4)*size-gap/2,y_shift+(height/2)*size+gap);
						ctx.fillText('X' + InvSigns[0] + UniId[2],x_shift-2*gap,y_shift+(height/2)*size+size/2+gap);
						
						ctx.moveTo(x_shift+(width/4)*size+gap/2,y_shift+(height/2)*size+gap);
						ctx.lineTo(x_shift+(width/2)*size-gap/2,y_shift+(height/2)*size+gap);
						ctx.fillText('X' + InvSigns[1] + UniId[2],x_shift+3*(width/8)*size-gap,y_shift+(height/2)*size+size/2+gap);
							
					case "2":
						//x1
						ctx.moveTo(x_shift+(width/2)*size+gap,y_shift-(height/2)*size+gap/2);
						ctx.lineTo(x_shift+(width/2)*size+gap,y_shift-gap/2);
						ctx.fillText('X' + InvSigns[0] + UniId[1],x_shift+(width/2)*size+5+gap,y_shift-(height/4)*size+2*gap);
							
						ctx.moveTo(x_shift+(width/2)*size+gap,y_shift+gap/2);
						ctx.lineTo(x_shift+(width/2)*size+gap,y_shift+(height/2)*size-gap/2);
						ctx.fillText('X' + InvSigns[1] + UniId[1],x_shift+(width/2)*size+5+gap,y_shift+(height/4)*size+2*gap);
						
					case "1":
						//x0
						ctx.moveTo(x_shift-(width/2)*size+gap/2,y_shift-(height/2)*size-gap);
						ctx.lineTo(x_shift-gap/2,y_shift-(height/2)*size-gap);
						ctx.fillText('X' + InvSigns[0] + UniId[0],x_shift-(width/4)*size-2*gap,y_shift-(height/2)*size-gap-5);
						
						ctx.moveTo(x_shift+gap/2,y_shift-(height/2)*size-gap);
						ctx.lineTo(x_shift+(width/2)*size-gap/2,y_shift-(height/2)*size-gap);
						ctx.fillText('X' + InvSigns[1] + UniId[0],x_shift+(width/4)*size-2*gap,y_shift-(height/2)*size-gap-5);
				}
				
				ctx.stroke();
				ctx.closePath();
			}

			function drawKarnaughcard(NumOfVars)
			{
				var size = (4-Math.ceil(NumOfVars/2))*40;// 1,2: 120, 3,4: 80, 5,6: 40	
				var width = Math.pow(2,Math.ceil(NumOfVars/2));
				var height = Math.pow(2,Math.floor(NumOfVars/2));
				var gap = (4-Math.ceil(NumOfVars/2))*3;
				var x_shift = 210 - 20*(NumOfVars==6);
				var y_shift = 210 + 10*(NumOfVars==6);
				
				ctx.fillStyle = "rgb(192,192,192)";
				ctx.globalAlpha = 0.7;				
				
				for(var i = 0; i < Math.pow(2,NumOfVars); i++)
					ctx.fillRect(x_shift-(width/2 - poses[NumOfVars-1][i][0])*size+gap/2,y_shift-(height/2 - poses[NumOfVars-1][i][1])*size+gap/2, size-gap, size-gap);
			}
 
			function onDocumentMouseDown(event)
			{
				event.preventDefault();
				container.addEventListener('mousemove', onDocumentMouseMove, false);
				container.addEventListener('mouseup', onDocumentMouseUp, false);
				container.addEventListener('mouseout', onDocumentMouseOut, false);
				mouseXOnMouseDown = event.clientX;
				targetRotationOnMouseDownX = targetRotationX;
				mouseYOnMouseDown = event.clientY;
				targetRotationOnMouseDownY = targetRotationY;
			}
 
			function onDocumentMouseMove(event)
			{
				mouseX = event.clientX;
				mouseY = event.clientY;
				targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.02;
				targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * 0.02;
			}
 
			function onDocumentMouseUp(event)
			{
				container.removeEventListener('mousemove', onDocumentMouseMove, false);
				container.removeEventListener('mouseup', onDocumentMouseUp, false);
				container.removeEventListener('mouseout', onDocumentMouseOut, false);
			}
 
			function onDocumentMouseOut(event)
			{
				container.removeEventListener('mousemove', onDocumentMouseMove, false);
				container.removeEventListener('mouseup', onDocumentMouseUp, false);
				container.removeEventListener('mouseout', onDocumentMouseOut, false);
			}
 
			function onDocumentTouchStart(event)
			{
				if (event.touches.length == 1)
				{
					event.preventDefault();
					mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
					targetRotationOnMouseDownX = targetRotationX;
					mouseYOnMouseDown = event.touches[ 0 ].pageY - windowHalfY;
					targetRotationOnMouseDownY = targetRotationY;		 
				}
			}
 
			function onDocumentTouchMove(event)
			{
				if (event.touches.length == 1)
				{
					event.preventDefault();
					mouseX = event.touches[ 0 ].pageX - windowHalfX;
					targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * 0.04;
					mouseY = event.touches[ 0 ].pageY - windowHalfY;
					targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.04;
				}
			}
 
			function animate()
			{
				requestAnimationFrame(animate);
				render();
			}
 
			function render()
			{
				//horizontal rotation   
				groupCubes.rotation.y += (targetRotationX - groupCubes.rotation.y) * 0.05;
				groupPlanes.rotation.y += (targetRotationX - groupPlanes.rotation.y) * 0.05;
				//vertical rotation 
				groupCubes.rotation.x += (targetRotationY - groupCubes.rotation.x) * 0.025;
				groupPlanes.rotation.x += (targetRotationY - groupPlanes.rotation.x) * 0.025;
				renderer.render(scene, camera);
			}
			
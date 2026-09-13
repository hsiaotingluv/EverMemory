"""Original EverMemory assets. Run in Blender; export coordinates are glTF Y-up."""
import bpy, math, random
from mathutils import Vector
from pathlib import Path
ROOT=Path('/Users/admin/Documents/ChatGPT/EverMemory')
rng=random.Random(19)
scene=bpy.data.scenes.new('EverMemory_Refinements')
bpy.context.window.scene=scene
scene['evermemory_authored']=True
scene.unit_settings.system='METRIC'
C=scene.collection

def xyz(p): return (p[0],-p[2],p[1])
def mat(name,hexcode,emission=0,roughness=.76):
    m=bpy.data.materials.new('EM_'+name);m.use_nodes=True
    rgb=[int(hexcode[i:i+2],16)/255 for i in (1,3,5)]
    linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    m.diffuse_color=(*linear,1)
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*linear,1);bs.inputs['Roughness'].default_value=roughness
    if emission: bs.inputs['Emission Color'].default_value=(*linear,1);bs.inputs['Emission Strength'].default_value=emission
    return m
wood=mat('Rosewood','#673c2b');gold=mat('HoneyWood','#b58049');floor_mats=[mat('Floor'+str(i),c) for i,c in enumerate(['#a36f42','#b57e4c','#9b653c','#bd8953'])]
plaster=mat('WarmPlaster','#e0b889');red=mat('Lacquer','#a44837');roofmat=mat('RoofSlate','#52484c');roofedge=mat('RoofEdge','#89705e')
cream=mat('Porcelain','#f2e1bb',roughness=.35);blue=mat('BlueGlaze','#4f929d',roughness=.22);tea=mat('Oolong','#8f5125',roughness=.2)
paper=mat('LanternPaper','#ed9b58',.65);flame=mat('LanternGlow','#ffd487',2);leaf=mat('PottedGreen','#73935e');skin=mat('Skin','#e2b191');blush=mat('Cheeks','#d98b7c');hair=mat('ChestnutHair','#503228');hairshine=mat('HairHighlights','#79503a');blouse=mat('IvoryBlouse','#efdbb5');skirtmat=mat('RoseSkirt','#9a5260');bootmat=mat('Boots','#674430');bagmat=mat('OchreCanvas','#c09053')

def group(name,parent=None,loc=(0,0,0)):
    o=bpy.data.objects.new(name,None);C.objects.link(o);o.parent=parent;o.location=xyz(loc);return o

def assign(o,name,parent,loc,material):
    o.name=name;o.parent=parent;o.location=xyz(loc)
    if material:o.data.materials.append(material)
    return o

def box(name,p,loc,size,m,bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o=bpy.context.object;assign(o,name,p,loc,m);o.scale=(size[0],size[2],size[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft crafted edges','BEVEL');mod.width=bevel;mod.segments=2
        o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
    return o

def ellipsoid(name,p,loc,scale,m,segments=20,rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1)
    o=bpy.context.object;assign(o,name,p,loc,m);o.scale=(scale[0],scale[2],scale[1])
    for f in o.data.polygons:f.use_smooth=True
    return o

def geometry(name,p,verts,faces,m,smooth=False):
    me=bpy.data.meshes.new(name);me.from_pydata([xyz(v) for v in verts],[],faces);me.update()
    o=bpy.data.objects.new(name,me);C.objects.link(o);o.parent=p;me.materials.append(m)
    for f in me.polygons:f.use_smooth=smooth
    return o

def tube(name,p,pts,r,m):
    cv=bpy.data.curves.new(name,'CURVE');cv.dimensions='3D';cv.resolution_u=7;cv.bevel_depth=r;cv.bevel_resolution=2
    s=cv.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
    for b,pt in zip(s.bezier_points,pts):b.co=xyz(pt);b.handle_left_type=b.handle_right_type='AUTO'
    ob=bpy.data.objects.new(name,cv);C.objects.link(ob);ob.parent=p;cv.materials.append(m);return ob

def lathe(name,p,profile,m,n=32,pleat=0,depth=1):
    verts=[]
    for y,r in profile:
        for i in range(n):
            a=i*math.tau/n;rr=r*(1+pleat*math.cos(a*12));verts.append((rr*math.sin(a),y,rr*math.cos(a)*depth))
    faces=[]
    for j in range(len(profile)-1):
        for i in range(n): a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
    faces.extend([tuple(range(n-1,-1,-1)),tuple((len(profile)-1)*n+i for i in range(n))])
    return geometry(name,p,verts,faces,m,True)

# Female traveller: separate named pivots retain live procedural walk animation.
female=group('FemaleTraveller');body=group('TravellerBody',female)
lathe('TailoredBlouse',body,[(.89,.23),(1.00,.205),(1.14,.24),(1.34,.30),(1.42,.25),(1.45,.135)],blouse,32,depth=.67)
ellipsoid('Neck',body,(0,1.46,0),(.105,.14,.095),skin)
head=ellipsoid('TravellerHead',body,(0,1.74,.025),(.235,.28,.218),skin)
# Hand-modelled soft hair cap and shoulder-length layers, with a bow at the back.
hairGroup=group('TravellerHair',body)
verts=[];faces=[];n=32;rows=10
for j in range(rows+1):
    theta=(j/rows)*1.91
    for i in range(n):
        a=i*math.tau/n;front=max(0,math.cos(a));yy=1.79+.275*math.cos(theta)+front*.035
        verts.append((.249*math.sin(theta)*math.sin(a),yy,-.015+.23*math.sin(theta)*math.cos(a)))
for j in range(rows):
    for i in range(n):a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
geometry('HairCap',hairGroup,verts,faces,hair,True)
for i in range(9):
    x=(i-4)*.05
    tube('FlowingHair',hairGroup,[(x,1.77,-.18),(x*1.1,1.45,-.24),(x*1.15,1.15+abs(x)*.6,-.24),(x*1.1,1.08+abs(x)*.55,-.2)],.046,hair)
for side in [-1,1]:
    tube('FaceFramingLock',hairGroup,[(side*.16,1.91,.12),(side*.23,1.66,.08),(side*.23,1.4,.025),(side*.19,1.27,.08)],.038,hair)
    tube('HairSheen',hairGroup,[(side*.09,1.94,-.12),(side*.16,1.66,-.22),(side*.16,1.22,-.255)],.009,hairshine)
    ellipsoid('Eye',body,(side*.085,1.77,.225),(.025,.036,.018),hair,16,8)
    ellipsoid('EyeGlint',body,(side*.078,1.783,.240),(.007,.008,.005),cream,10,6)
    tube('SoftBrow',body,[(side*.055,1.829,.221),(side*.089,1.843,.219),(side*.113,1.829,.212)],.009,hair)
    ellipsoid('Cheek',body,(side*.147,1.685,.201),(.035,.014,.008),blush,12,8)
    ellipsoid('Ear',body,(side*.225,1.72,.005),(.038,.058,.026),skin,12,8)
    ellipsoid('BowLoop',hairGroup,(side*.085,1.36,-.287),(.09,.048,.034),red,16,8)
tube('Smile',body,[(-.035,1.64,.224),(0,1.633,.23),(.035,1.64,.224)],.006,blush)
ellipsoid('Nose',body,(0,1.715,.231),(.020,.025,.026),skin,12,8)
ellipsoid('BowKnot',hairGroup,(0,1.36,-.32),(.033,.034,.024),gold)
# Split collar, fabric buttons, cinched waist and a softly pleated skirt.
for side in [-1,1]:
    geometry('BlouseCollar',body,[(0,1.43,.12),(side*.15,1.425,.09),(side*.09,1.3,.18)],[(0,1,2)],cream)
    for yy in [1.22,1.1]:ellipsoid('BlouseButton',body,(0,yy,.16),(.015,.015,.008),gold,10,6)
skirt=group('TravellerSkirt',body)
lathe('PleatedSkirt',skirt,[(.41,.41),(.46,.405),(.65,.35),(.84,.275),(.97,.214)],skirtmat,72,.036,depth=.80)
lathe('SkirtHem',skirt,[(.407,.414),(.433,.413)],gold,72,.036,depth=.80)
lathe('WaistBelt',body,[(.94,.216),(.983,.216)],wood,32,depth=.71)
for side,tag in [(-1,'L'),(1,'R')]:
    arm=group('Arm_'+tag,body,(side*.31,1.36,0))
    ellipsoid('PuffSleeve_'+tag,arm,(side*.016,-.1,0),(.112,.17,.12),blouse)
    ellipsoid('Sleeve_'+tag,arm,(side*.035,-.28,0),(.075,.18,.08),blouse)
    ellipsoid('Hand_'+tag,arm,(side*.04,-.49,.014),(.065,.099,.055),skin)
    leg=group('Leg_'+tag,body,(side*.14,.61,0))
    ellipsoid('Stocking_'+tag,leg,(0,-.20,0),(.087,.26,.083),cream)
    box('WalkingBoot_'+tag,leg,(0,-.51,.065),(.18,.18,.31),bootmat,.055)
    box('BootSole_'+tag,leg,(0,-.59,.065),(.19,.035,.32),wood,.014)
    tube('BackpackStrap_'+tag,body,[(side*.20,1.38,-.18),(side*.23,1.38,.05),(side*.2,1.13,.18),(side*.20,1.0,-.17)],.025,bagmat)
box('CanvasBackpack',body,(0,1.17,-.3),(.39,.44,.21),bagmat,.08)
box('BackpackFlap',body,(0,1.36,-.39),(.40,.13,.075),gold,.025)
box('BackpackPocket',body,(0,1.09,-.418),(.24,.16,.045),gold,.025)

# Kongming lantern: a translucent-looking faceted paper envelope, rounded shoulders,
# open bamboo base, crossed supports and a warm inner light.
kong=group('KongmingLantern')
lathe('KongmingPaper',kong,[(.15,.27),(.30,.38),(.80,.48),(1.18,.44),(1.34,.34),(1.40,.08)],paper,40,depth=.84)
for y,r in [(.16,.275),(.32,.39),(1.18,.447)]:
    pts=[(r*math.sin(i*math.tau/32),y,r*.84*math.cos(i*math.tau/32)) for i in range(33)]
    tube('PaperSeam',kong,pts,.011,gold)
for side in [-1,1]:tube('BambooBase',kong,[(-.26,.135,side*.17),(0,.135,0),(.26,.135,-side*.17)],.015,wood)
ellipsoid('LanternFlame',kong,(0,.24,0),(.058,.13,.058),flame)

# Walk-in teahouse: a full room with an open front doorway and individually
# addressable upper walls/roof for the game camera's cutaway.
teahouse=group('RainlightTeahouse')
roofGroup=group('TeahouseRoof',teahouse)
for ix in range(20):
    for iz in range(5):box('Floorboard',teahouse,(-5.7+ix*.6,.035,-4+iz*2),(.585,.12,1.985),rng.choice(floor_mats),.008)
box('BackWall',teahouse,(0,1.85,-4.92),(12,3.7,.18),plaster)
for side in [-1,1]:
    # Broad window openings on both sides retain a mountain view.
    box('SideSill',teahouse,(side*5.9,.55,0),(.20,1.1,10),red)
    box('SideLintel',roofGroup,(side*5.9,3.25,0),(.22,.95,10),plaster)
    for z in [-4.8,-2.4,0,2.4,4.8]:box('WindowColumn',teahouse,(side*5.9,1.9,z),(.20,3.8,.20),wood)
    for z in [j*.4-4.8 for j in range(25)]:box('WindowLattice',teahouse,(side*5.92,2.0,z),(.065,1.85,.065),gold,.008)
    for yy in [1.15,1.75,2.35,2.95]:box('WindowRail',teahouse,(side*5.94,yy,0),(.08,.07,9.8),gold,.01)
    box('FrontWall',teahouse,(side*3.75,1.65,4.92),(4.5,3.3,.22),red)
    box('DoorJamb',teahouse,(side*1.46,1.65,4.95),(.18,3.3,.26),wood)
    # Open door leaves lie beside the aperture rather than blocking it.
    box('OpenDoorLeaf',teahouse,(side*2.15,1.5,5.04),(1.2,2.9,.10),gold)
    for x in [side*(1.7+i*.22) for i in range(5)]:box('DoorLattice',teahouse,(x,1.8,5.12),(.048,1.55,.035),wood,.006)
    for yy in [1.05,1.55,2.05,2.55]:box('DoorLatticeRail',teahouse,(side*2.15,yy,5.14),(1.15,.04,.035),wood,.006)
box('DoorLintel',roofGroup,(0,3.42,4.97),(3.1,.6,.25),wood)
for x in [-5.9,-3,0,3,5.9]:
    box('RoofBeam',roofGroup,(x,3.7,0),(.22,.25,10.7),wood)
    if abs(x)>5:box('FrontColumn',teahouse,(x,1.85,5.1),(.24,3.7,.24),wood)
for y in [.35,1.08,3.2]:box('BackWallTrim',teahouse,(0,y,-4.79),(11.8,.14,.14),wood)
# Moon window surround and lattice on the rear wall.
pts=[(1.18*math.sin(i*math.tau/48),2.2+1.18*math.cos(i*math.tau/48),-4.70) for i in range(49)]
tube('MoonWindowFrame',teahouse,pts,.095,wood)
for x in [-.72,-.36,0,.36,.72]:
    half=math.sqrt(1.08**2-x*x);tube('MoonWindowLattice',teahouse,[(x,2.2-half,-4.65),(x,2.2+half,-4.65)],.024,gold)
for y in [1.52,1.88,2.24,2.60,2.96]:
    half=math.sqrt(max(.1,1.08**2-(y-2.2)**2));tube('MoonWindowLattice',teahouse,[(-half,y,-4.64),(half,y,-4.64)],.024,gold)
# Curved tiled roof, with one mesh for each roof panel and raised individual tile ribs.
nx,nz=30,20;w,d=13.3,11.4
roofHeight=lambda x,z:3.65+1.7*(1-abs(z)/(d/2))+.35*(abs(x)/(w/2))**8+.3*(abs(z)/(d/2))**8
verts=[];faces=[]
for j in range(nz+1):
    for i in range(nx+1):
        x=(i/nx-.5)*w;z=(j/nz-.5)*d;verts.append((x,roofHeight(x,z),z))
for j in range(nz):
    for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+nx+1,a+nx+2,a+1))
geometry('CurvedTileRoof',roofGroup,verts,faces,roofmat,True)
for i in range(43):
    x=(i/42-.5)*w
    for side in [-1,1]:tube('RoofTileRib',roofGroup,[(x,roofHeight(x,side*d/2*j/8)+.04,side*d/2*j/8) for j in range(9)],.037,roofedge)
for z in [-d/2,d/2]:tube('RoofEave',roofGroup,[(x,roofHeight(x,z),z) for x in [-w/2+i*w/20 for i in range(21)]],.095,gold)
# Tea table, low stools, tray, cups, patterned ceramic teapot and shelving.
box('TeaTable',teahouse,(0,.69,.4),(2.6,.16,1.4),gold,.09)
for x in [-1,1]:
    for z in [-.1,.9]:box('TableLeg',teahouse,(x,.34,z),(.13,.68,.13),wood)
for x,z in [(-1.95,.4),(1.95,.4),(0,1.85)]:
    box('LowStool',teahouse,(x,.3,z),(.75,.14,.7),wood,.045)
    box('StoolCushion',teahouse,(x,.40,z),(.68,.12,.63),skirtmat,.07)
    for xx in [-.26,.26]:box('StoolLeg',teahouse,(x+xx,.12,z),(.09,.24,.55),wood)
box('TeaTray',teahouse,(0,.80,.4),(1.55,.055,.82),wood,.025)
# Lathed pottery and curved spout gives props a authored silhouette.
def teapot(p,loc,scale=1):
    g=group('BlueTeapot',p,loc);g.scale=(scale,scale,scale)
    lathe('TeapotBody',g,[(0,.18),(.05,.28),(.20,.34),(.35,.28),(.39,.16)],blue,32)
    lathe('TeapotLid',g,[(.385,.18),(.41,.19),(.44,.1)],cream,32)
    ellipsoid('LidKnob',g,(0,.47,0),(.05,.045,.05),blue)
    tube('TeapotSpout',g,[(.22,.13,0),(.40,.19,0),(.50,.39,0)],.065,blue)
    tube('TeapotHandle',g,[(-.22,.08,0),(-.43,.12,0),(-.46,.31,0),(-.23,.36,0)],.035,gold)
    return g
teapot(teahouse,(0,.835,.28),.8)
for x,z in [(-.48,.62),(.48,.62),(-.48,.17)]:
    g=group('Teacup',teahouse,(x,.84,z));lathe('Cup',g,[(0,.07),(.04,.095),(.13,.12),(.145,.12),(.145,.1),(.055,.07)],cream,24)
    lathe('TeaSurface',g,[(.125,.097),(.126,.097)],tea,24)
# Furniture hugs edges and leaves generous walkable space around the table.
box('TeaCounter',teahouse,(3.8,.67,-3.55),(3.2,1.3,1.3),wood)
box('CounterTop',teahouse,(3.8,1.36,-3.55),(3.35,.15,1.45),gold)
for y in [1.6,2.2,2.8]:
    box('TeaShelf',teahouse,(-3.4,y,-4.42),(3.2,.12,.7),wood)
    for x in [-4.4,-3.6,-2.8]:
        g=group('TeaJar',teahouse,(x,y+.07,-4.42));lathe('CeramicJar',g,[(0,.18),(.12,.25),(.43,.23),(.50,.17)],rng.choice([blue,cream,red]),24)
        box('JarLabel',g,(0,.27,.23),(.18,.23,.014),cream,.008)
teapot(teahouse,(3.7,1.47,-3.6),1.1)
for side in [-1,1]:
    g=group('HangingPaperLamp',teahouse,(side*3.4,2.7,1.5));lathe('Shade',g,[(0,.32),(.1,.42),(.53,.42),(.68,.30)],paper,32)
    tube('LampCord',teahouse,[(side*3.4,3.4,1.5),(side*3.4,3.8,1.5)],.017,wood)
    g=group('PottedPlant',teahouse,(side*4.7,.1,3.5));lathe('Pot',g,[(0,.22),(.40,.34)],red,24)
    for a in range(6):
        angle=a*math.tau/6;tube('LeafStem',g,[(0,.3,0),(.25*math.sin(angle),.75,.25*math.cos(angle))],.016,gold)
        ellipsoid('PlantLeaf',g,(.28*math.sin(angle),.79,.28*math.cos(angle)),(.13,.26,.06),leaf,12,8)

exec((ROOT/'assets/blender/reference_details.py').read_text())

# Place assets side-by-side for their editable Blender authoring scene.
female.location=xyz((-1,0,8));kong.location=xyz((2,0,8));teahouse.location=xyz((0,0,-2))
for root in [female,kong,teahouse]:root['authoring_source']='assets/blender/build_refinements.py'
# Export roots with local transforms; the game places each asset in the world.
positions={o:o.location.copy() for o in [female,kong,teahouse]}
for o in positions:o.location=(0,0,0)
bpy.context.view_layer.update()
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/jiufen-refinements.glb'),export_format='GLB',use_active_scene=True,export_apply=True,export_animations=False,export_extras=True,export_cameras=False,export_lights=False)
for o,p in positions.items():o.location=p
# An authoring camera and studio light remain in the .blend, not the web asset.
bpy.ops.object.camera_add(location=xyz((16,12,20)))
camera=bpy.context.object;camera.name='RefinementCamera';direction=Vector(xyz((0,1.6,-1)))-camera.location;camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();scene.camera=camera;camera.data.type='ORTHO';camera.data.ortho_scale=22
bpy.ops.object.light_add(type='AREA',location=xyz((2,12,8)))
lamp=bpy.context.object;lamp.name='WarmStudio';lamp.data.energy=2200;lamp.data.shape='DISK';lamp.data.size=10
lamp.rotation_euler=(Vector(xyz((0,0,-1)))-lamp.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('RefinementWorld');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.32,.25,.19,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.7
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL'
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/blender/jiufen-refinements.blend'))
result={'scene':scene.name,'objects':len(scene.objects),'glb_bytes':(ROOT/'public/models/jiufen-refinements.glb').stat().st_size,'blend':str(ROOT/'assets/blender/jiufen-refinements.blend')}

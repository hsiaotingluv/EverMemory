"""Three original 8-second symbolic flashbacks, rendered locally in Blender."""
import bpy, math
from mathutils import Vector
from pathlib import Path
ROOT=Path('/Users/admin/Documents/ChatGPT/EverMemory')
(ROOT/'public/memories').mkdir(parents=True,exist_ok=True)
source=bpy.data.scenes['EverMemory_Refinements']
base=(ROOT/'assets/blender/build_refinements.py').read_text().split('# Female traveller:')[0]
base=base[base.index('def xyz'):]
base=base.replace("    m=bpy.data.materials.new('EM_'+name);m.use_nodes=True", "    if bpy.data.materials.get('EM_'+name):return bpy.data.materials['EM_'+name]\n    m=bpy.data.materials.new('EM_'+name);m.use_nodes=True")
# Helper functions refer to C, the collection for the current film.
exec(base)
def clone_tree(original,parent=None):
    new=original.copy();C.objects.link(new);new.parent=parent
    if parent is None:new.location=(0,0,0)
    for child in original.children:clone_tree(child,new)
    return new

def film(name):
    global scene,C
    scene=bpy.data.scenes.new('Memory_'+name);C=scene.collection;bpy.context.window.scene=scene
    scene.render.engine='BLENDER_EEVEE';scene.eevee.taa_render_samples=8
    scene.render.resolution_x=640;scene.render.resolution_y=360;scene.render.resolution_percentage=100
    scene.render.fps=12;scene.frame_start=1;scene.frame_end=96
    scene.render.image_settings.media_type='VIDEO';scene.render.image_settings.file_format='FFMPEG';scene.render.ffmpeg.format='WEBM';scene.render.ffmpeg.codec='WEBM';scene.render.ffmpeg.constant_rate_factor='MEDIUM';scene.render.filepath=str(ROOT/'public/memories'/name)
    scene.world=bpy.data.worlds.new('MemoryWorld_'+name);scene.world.use_nodes=True;bg=scene.world.node_tree.nodes['Background'];bg.inputs[0].default_value=(.40,.24,.12,1);bg.inputs[1].default_value=.7
    bpy.ops.object.light_add(type='AREA',location=xyz((-3,6,5)));o=bpy.context.object;o.data.energy=600;o.data.color=(1,.68,.37);o.data.size=6;o.rotation_euler=(Vector(xyz((0,0,0)))-o.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.lens=47
    scene.view_settings.view_transform='AgX'
    return cam

def camera_motion(cam,start,end,focus):
    for frame,pos in [(1,start),(96,end)]:
        cam.location=xyz(pos);cam.rotation_euler=(Vector(xyz(focus))-cam.location).to_track_quat('-Z','Y').to_euler();cam.keyframe_insert(data_path='location',frame=frame);cam.keyframe_insert(data_path='rotation_euler',frame=frame)

cam=film('rain');room=clone_tree(bpy.data.objects['RainlightTeahouse']);[setattr(o,'hide_render',True) for o in room.children if o.name.startswith('TeahouseRoof')]
camera_motion(cam,(2.2,1.75,3.25),(-.7,1.58,2.8),(0,1,.35))
# Luminous rain outside the lattice and rising steam above the cup.
for i in range(22):
    x=-5+(i%11)*.9;z=-4.4-(i//11)*.15
    o=tube('RememberedRain',None,[(x,2,z),(x-.02,2.5,z)],.009,cream)
    o.location.z=.8;o.keyframe_insert(data_path='location',frame=1);o.location.z=-1.2;o.keyframe_insert(data_path='location',frame=96)
bpy.ops.render.render(animation=True)
cam=film('lanterns')
box('NightWall',None,(0,1,-2.8),(15,7,.2),wood);box('Street',None,(0,-.1,0),(18,.2,12),gold)
for x in [-5,-2.5,0,2.5,5]:
    box('LitWindow',None,(x,2.2,-2.6),(1.7,2.4,.1),paper)
    for xx in [-.5,0,.5]:box('WindowLattice',None,(x+xx,2.2,-2.48),(.05,2.4,.08),wood)
for i in range(12):
    g=clone_tree(bpy.data.objects['KongmingLantern']);g.location=xyz((-5.5+i,3+math.sin(i*.6)*.3,-1));g.scale=(.6,.6,.6)
    g.rotation_euler.y=-.06;g.keyframe_insert(data_path='rotation_euler',frame=1);g.rotation_euler.y=.08;g.keyframe_insert(data_path='rotation_euler',frame=96)
camera_motion(cam,(-3,1.8,6),(2,2.3,5),(0,2.8,-1))
bpy.ops.render.render(animation=True)
cam=film('mooncake')
box('Table',None,(0,.6,0),(5,.18,3),gold);box('TeaTray',None,(0,.73,0),(2.9,.12,1.8),wood)
# A scalloped mooncake and two generous pieces recall a shared family table.
cake=group('Mooncake');cake.location=xyz((0,.82,0))
lathe('MooncakeCrust',cake,[(0,.48),(.09,.53),(.3,.53),(.35,.46)],gold,48,pleat=.035)
for i in range(12):
    a=i*math.tau/12;ellipsoid('ScallopedCrust',cake,(.46*math.sin(a),.19,.46*math.cos(a)),(.11,.17,.11),gold,12,8)
lathe('BakedTop',cake,[(.348,.39),(.36,.39)],red,48)
for i in range(6):
    a=i*math.tau/6;tube('FlowerEmboss',cake,[(0,.37,0),(.2*math.sin(a+.4),.37,.2*math.cos(a+.4)),(.28*math.sin(a),.37,.28*math.cos(a)),(.2*math.sin(a-.4),.37,.2*math.cos(a-.4)),(0,.37,0)],.018,gold)
for x in [-1.0,1.0]:
    g=group('RememberedCup',None,(x,.81,.15));lathe('PorcelainCup',g,[(0,.15),(.08,.2),(.34,.27),(.36,.27),(.36,.23),(.1,.13)],cream,32);lathe('Tea',g,[(.30,.224),(.305,.224)],tea,32)
box('DistantWindow',None,(0,2.4,-3.5),(7,4,.2),wood)
for x in [-2,0,2]:box('GoldenWindow',None,(x,2.4,-3.3),(1.75,3,.1),paper)
camera_motion(cam,(2.5,2.9,3.9),(1.2,2.1,3.2),(0,1,0))
bpy.ops.render.render(animation=True)
bpy.context.window.scene=source
# Keep all film scenes editable with the authored assets.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/blender/jiufen-refinements.blend'))
for name in ['rain','lanterns','mooncake']:
    for rendered in (ROOT/'public/memories').glob(name+'[0-9]*.webm'): rendered.replace(ROOT/'public/memories'/(name+'.webm'))
result={'films':[(p.name,p.stat().st_size) for p in (ROOT/'public/memories').glob('*.webm')]}

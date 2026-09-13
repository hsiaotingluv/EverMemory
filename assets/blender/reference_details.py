"""Teahouse details drawn from the user's four interior/exterior photographs."""
# This block is also included by build_refinements.py before export.
jarred=mat('StorageJarRed','#9c3d29',roughness=.28)
jarblack=mat('IronKettle','#3d3530',roughness=.48)
tin=mat('TeaTin','#d6c29c',roughness=.42)
# A second storey folds away with the roof when the traveller enters.
for child in list(roofGroup.children):child.location.z+=3.05
box('UpperStoreyBack',roofGroup,(0,5.1,-4.92),(11.8,3.05,.15),wood)
for side in [-1,1]:box('UpperStoreySide',roofGroup,(side*5.9,5.1,0),(.15,3.05,9.8),red)
for x in [-5.6,-3.8,-2,0,2,3.8,5.6]:
    box('UpperWindowFrame',roofGroup,(x,5.1,4.96),(.12,2.9,.15),wood)
for y in [3.65,4.03,6.05,6.45]:box('UpperWindowBeam',roofGroup,(0,y,4.96),(12,.16,.15),gold)
for x in [-5.3+i*.4 for i in range(28)]:
    box('UpperLattice',roofGroup,(x,5.05,4.96),(.038,2.05,.065),gold,.008)
for y in [4.55,5.12,5.70]:box('UpperCrossLattice',roofGroup,(0,y,4.97),(11.6,.035,.06),gold,.008)
box('UpperWindowGlow',roofGroup,(0,5.1,4.88),(11.65,2.75,.025),paper,.005)
box('BalconyFloor',roofGroup,(0,3.65,5.3),(12.5,.20,1.1),wood)
box('BalconyHandrail',roofGroup,(0,4.35,5.8),(12.5,.14,.13),gold)
for x in [-6+i*.4 for i in range(31)]:box('BalconySpindle',roofGroup,(x,4,5.8),(.045,.7,.06),wood,.008)
# Warm timber panelling, ceramic storage jars and a lived-in counter.
for x in [-5.6+i*.4 for i in range(29)]:box('BackWallBoard',teahouse,(x,1.9,-4.79),(.025,3.4,.027),gold,.005)
for y in [.18,.93,1.68,2.43]:
    box('LongJarShelf',teahouse,(2.75,y,-4.42),(5.1,.10,.77),wood)
    for i in range(7):
        x=.52+i*.72
        g=group('StoragePot',teahouse,(x,y+.06,-4.43))
        lathe('GlazedJar',g,[(0,.14),(.10,.23),(.34,.27),(.48,.21),(.53,.13)],jarred if i%3 else blue,24)
        lathe('JarLid',g,[(.53,.15),(.56,.17),(.59,.12)],wood,20)
# Antique kettle set into a brazier on the honey-coloured serving counter.
box('BrassBrazier',teahouse,(3.7,1.47,-3.55),(1.05,.12,.9),gold)
box('BrazierAsh',teahouse,(3.7,1.54,-3.55),(.87,.02,.72),roofmat)
kettle=group('IronKettle',teahouse,(3.7,1.56,-3.55))
lathe('KettleBody',kettle,[(0,.18),(.12,.31),(.36,.34),(.49,.24)],jarblack,32)
lathe('KettleLid',kettle,[(.48,.24),(.53,.19),(.55,.12)],jarblack,24)
tube('ArchedKettleHandle',kettle,[(-.23,.4,0),(-.28,.75,0),(0,.87,0),(.28,.75,0),(.23,.4,0)],.035,gold)
tube('KettleSpout',kettle,[(.27,.16,0),(.46,.28,0),(.55,.43,0)],.075,jarblack)
for i in range(5):
    g=group('WrappedTea',teahouse,(2.48+i*.31,1.48,-2.99));box('TeaPacket',g,(0,.10,0),(.23,.2,.26),cream,.06)
    tube('PacketString',g,[(-.12,.14,0),(0,.22,0),(.12,.14,0)],.009,red)
for i in range(4):
    g=group('TeaTin',teahouse,(4.6+i*.25,1.47,-3.66));lathe('Tin',g,[(0,.095),(.3,.095)],tin,20);lathe('TinLid',g,[(.3,.1),(.33,.1)],wood,20)
# Smaller teapots beside the moon window leave the central sightline open.
for i in range(3):teapot(teahouse,(-4.1+i*.7,2.27,-4.35),.55)

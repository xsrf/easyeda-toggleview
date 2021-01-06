EasyEDA ToggleView Extension
============================
Download this code, open [EasyEDA](https://easyeda.com/editor), go to "Advanced" > "Extensions" > "Extensions Settings ..." > "Load Extension..." > "Select Files ..." > Select all files from the "extension" directory > "Load Extension".

A "ToggleView" Menu should appear in the main menu in PCB view.

<img src="EasyEDA-ToggleView.gif" alt="Screenshot of EasyEDA Menu with ToggleView Button"/>

Known Issues
------------
The X ruler is not flipped correctly

How does it work?
-----------------
This is just a hacky workaround until EasyEDA implements it correctly.
It basically applies the style `transform: scaleX(-1)` to the editor to flip it in X direction.
To still be able to interact (click) with the flipped view with your mouse correctly, all mouse events also need to be catched and flipped in x direction.
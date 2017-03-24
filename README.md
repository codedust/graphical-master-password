# Graphical Master Password
This extension adds a shoulder-surfing resistant graphical master password to
the firefox password manager.

The addon makes use of the vast human capacity to store and process visual information. Upon installation a group of images is shown. We call these images the *familiar information*. Multiple grids of images will later be shown in the authentication phase where excactly one image per grid is part of the *familiar information*. The user has to point out the one image that was shown in the setup phase to authenticate her-/himself.

Blakley (t,n)-secret-sharing is used to prevent shoulder-surfing attacks by retrieving the shared secret from a subset of the images that are part of the *familiar information*. During each authentication attempt, a random subset of the *familiar information* has to be provided by the user.

## Installation
To use this addon, install Firefox Developer Edition or Firefox Nightly (these allow you to disable signature checks for addons). Signature checks can be disabled by setting `xpinstall.signatures.required` to `false` in `about:config`.

This addon uses the Experimental Logins API that is a not implemented in Firefox yet. To enable the API, please first install the corresponding [WebExtensions Experiment](https://addons.mozilla.org/en-US/firefox/addon/experimental-logins-api/).

After this step, this addon can be tested as any other WebExtension by clicking `Load Temporary Add-on` in `about:debugging`.

## License
This program is free software: you can redistribute it and/or modify
it under the terms of the *GNU Affero General Public License* as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

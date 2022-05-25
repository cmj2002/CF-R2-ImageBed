import re


def parse_mounts(separator) -> tuple:
    """ Return a map of Windows roots to their corresponding Linux root and a
        map of Linux roots to their corresponding Windows root.
    """
    # Map a Windows root to a Linux root
    linux_roots = {}
    # Map a Linux root to a Windows root
    windows_roots = {}

    with open("/proc/mounts", "rb") as fd:
        for line in fd.read().splitlines():
            source, target, type_, description_ = line.split(b" ", 3)
            # Decode the string (backslash-escaped octal values)
            source = source.decode("unicode-escape")[:-len(separator)]
            target = target.decode("unicode-escape")
            # check if description contains "aname=drvfs"
            if type_ != b"9p" or not re.search(r"aname=drvfs", description_.decode("unicode-escape")):
                continue
            linux_roots[source] = target
            windows_roots[target] = source

    return linux_roots, windows_roots


def find_root(roots, path, separator):
    """ Return the root matching the given path followed by a separator. """

    candidates = [
        x for x in roots
        if path == x or path.startswith("{}{}".format(x, separator))]
    if not candidates:
        raise Exception("No root found for {}".format(path))
    elif len(candidates) > 1:
        raise Exception("Multiple roots found for {}".format(path))

    return candidates[0]


def convertPath(windows_path: str) -> str:
    """
    Converts a path to WSL
    """
    linux_roots = parse_mounts('\\')[0]
    windows_root = find_root(linux_roots, windows_path, '\\')
    windows_leaf = windows_path[len(windows_root):]

    if not windows_leaf.startswith("\\"):
        raise Exception("Cannot convert relative Windows path")

    linux_root = linux_roots[windows_root]
    linux_leaf = windows_leaf.replace("\\", "/")

    return "".join([linux_root, linux_leaf])


if __name__ == "__main__":
    print(convertPath("C:\\Users\\joe\\Documents\\test.txt"))

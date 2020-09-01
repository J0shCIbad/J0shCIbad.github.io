def fun(par1 = 1, par2 = 1.0):
    print("par1: %2d" % par1)
    print("par2: %5.2f" % par2)

fun()
fun(2, 2.0)
fun(3)
fun(par2=4.0)
fun(par2=5.0, par1=6)
